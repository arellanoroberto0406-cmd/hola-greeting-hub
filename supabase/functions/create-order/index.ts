import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateOrderRequest = {
  store_id: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
  };
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status?: string;
  items: Array<{
    product_id?: string | null;
    product_name: string;
    product_image: string;
    selected_color?: string | null;
    quantity: number;
    price: number;
  }>;
};

const isNonEmptyString = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const isFiniteNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = (await req.json()) as CreateOrderRequest;

    // Minimal validation (avoid RLS issues + garbage data)
    if (!isNonEmptyString(body?.store_id)) {
      return new Response(JSON.stringify({ error: "store_id requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.customer || !isNonEmptyString(body.customer.email) || !isNonEmptyString(body.customer.first_name) ||
        !isNonEmptyString(body.customer.last_name) || !isNonEmptyString(body.customer.phone) ||
        !isNonEmptyString(body.customer.address) || !isNonEmptyString(body.customer.city) ||
        !isNonEmptyString(body.customer.state) || !isNonEmptyString(body.customer.zip_code)) {
      return new Response(JSON.stringify({ error: "Datos de cliente incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isNonEmptyString(body.payment_method)) {
      return new Response(JSON.stringify({ error: "payment_method requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isFiniteNumber(body.subtotal) || !isFiniteNumber(body.shipping_cost) || !isFiniteNumber(body.total)) {
      return new Response(JSON.stringify({ error: "Totales inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "items requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If user is authenticated, attach user_id; otherwise keep null (guest checkout)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.id) userId = data.user.id;
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: body.store_id,
        user_id: userId,
        first_name: body.customer.first_name,
        last_name: body.customer.last_name,
        email: body.customer.email,
        phone: body.customer.phone,
        address: body.customer.address,
        city: body.customer.city,
        state: body.customer.state,
        zip_code: body.customer.zip_code,
        payment_method: body.payment_method,
        subtotal: body.subtotal,
        shipping_cost: body.shipping_cost,
        total: body.total,
        status: body.status ?? "pending",
      })
      .select("id, status, total")
      .single();

    if (orderError) {
      console.error("create-order: order insert failed", orderError);
      return new Response(
        JSON.stringify({ error: orderError.message ?? "Error creando pedido", details: orderError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderItems = body.items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id ?? null,
      product_name: it.product_name,
      product_image: it.product_image,
      selected_color: it.selected_color ?? null,
      quantity: it.quantity,
      price: it.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("create-order: items insert failed", itemsError);
      // Best-effort cleanup
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: itemsError.message ?? "Error creando items", details: itemsError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-order: unexpected error", e);
    return new Response(JSON.stringify({ error: "Error inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
