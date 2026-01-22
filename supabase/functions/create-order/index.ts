import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface CreateOrderItemInput {
  product_id?: string | null;
  product_name: string;
  product_image: string;
  selected_color?: string | null;
  quantity: number;
  price: number;
}

interface CreateOrderRequest {
  store_id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status?: string;
  items: CreateOrderItemInput[];
}

const isFiniteNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateOrderRequest = await req.json();

    if (!body?.store_id) {
      return new Response(JSON.stringify({ error: "store_id requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic store validation (avoid creating orders for inactive/nonexistent stores)
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, is_active")
      .eq("id", body.store_id)
      .single();

    if (storeError || !store) {
      return new Response(JSON.stringify({ error: "Tienda no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (store.is_active !== true) {
      return new Response(JSON.stringify({ error: "Tienda inactiva" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subtotal = Number(body.subtotal);
    const shippingCost = Number(body.shipping_cost);
    const total = Number(body.total);

    if (!Number.isFinite(subtotal) || !Number.isFinite(shippingCost) || !Number.isFinite(total)) {
      return new Response(JSON.stringify({ error: "Totales inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "items requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: body.store_id,
        user_id: body.user_id ?? null,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        payment_method: body.payment_method,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: body.status ?? "pending",
      })
      .select("id, payment_method, total")
      .single();

    if (orderError || !order) {
      console.error("[create-order] orders insert error", orderError);
      return new Response(
        JSON.stringify({ error: orderError?.message ?? "No se pudo crear el pedido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const orderItems = body.items.map((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
        throw new Error("Item inválido: quantity/price");
      }
      return {
        order_id: order.id,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        product_image: item.product_image,
        selected_color: item.selected_color ?? null,
        quantity,
        price,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems as unknown as Json);
    if (itemsError) {
      console.error("[create-order] order_items insert error", itemsError);
      // Try to rollback the created order to avoid orphan orders
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, order }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[create-order] error", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
