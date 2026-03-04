import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// --- Input sanitization helpers ---
const sanitizeString = (val: unknown, maxLen = 500): string => {
  if (typeof val !== "string") return "";
  // Strip HTML tags and trim
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
};

const sanitizeEmail = (val: unknown): string | null => {
  const s = sanitizeString(val, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(s) ? s.toLowerCase() : null;
};

const sanitizePhone = (val: unknown): string | null => {
  const s = sanitizeString(val, 20);
  const cleaned = s.replace(/[^\d+\-() ]/g, "");
  return cleaned.length >= 7 ? cleaned : null;
};

const sanitizeUUID = (val: unknown): string | null => {
  if (typeof val !== "string") return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val) ? val : null;
};

const VALID_PAYMENT_METHODS = ["card", "transfer", "cash", "paypal", "mercadopago"];
const MAX_ITEMS = 100;
const MAX_TOTAL = 999999.99;

interface CreateOrderItemInput {
  product_id?: string | null;
  product_name: string;
  product_image: string;
  selected_color?: string | null;
  quantity: number;
  price: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // --- Validate and sanitize all inputs ---
    const store_id = sanitizeUUID(body?.store_id);
    if (!store_id) {
      return new Response(JSON.stringify({ error: "store_id inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = sanitizeEmail(body?.email);
    if (!email) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phone = sanitizePhone(body?.phone);
    if (!phone) {
      return new Response(JSON.stringify({ error: "Teléfono inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const first_name = sanitizeString(body?.first_name, 50);
    const last_name = sanitizeString(body?.last_name, 50);
    const address = sanitizeString(body?.address, 200);
    const city = sanitizeString(body?.city, 100);
    const state = sanitizeString(body?.state, 100);
    const zip_code = sanitizeString(body?.zip_code, 10);

    if (!first_name || !last_name || !address || !city || !state || !zip_code) {
      return new Response(JSON.stringify({ error: "Datos de envío incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment_method = sanitizeString(body?.payment_method, 20);
    if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
      return new Response(JSON.stringify({ error: "Método de pago inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user_id = body?.user_id ? sanitizeUUID(body.user_id) : null;

    // Store validation
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, is_active, min_order_amount")
      .eq("id", store_id)
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

    // Validate numeric totals
    const subtotal = Number(body.subtotal);
    const shippingCost = Number(body.shipping_cost);
    const total = Number(body.total);

    if (!Number.isFinite(subtotal) || !Number.isFinite(shippingCost) || !Number.isFinite(total)) {
      return new Response(JSON.stringify({ error: "Totales inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (subtotal < 0 || shippingCost < 0 || total < 0 || total > MAX_TOTAL) {
      return new Response(JSON.stringify({ error: "Montos fuera de rango" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate total consistency (allow small floating point drift)
    if (Math.abs(total - (subtotal + shippingCost)) > 0.02) {
      return new Response(JSON.stringify({ error: "El total no coincide con subtotal + envío" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Min order amount check
    if (store.min_order_amount && subtotal < store.min_order_amount) {
      return new Response(JSON.stringify({ error: `El pedido mínimo es $${store.min_order_amount}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
      return new Response(JSON.stringify({ error: "Items inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each item and calculate expected subtotal
    let calculatedSubtotal = 0;
    const sanitizedItems: CreateOrderItemInput[] = [];
    for (const item of body.items) {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity < 1 || quantity > 9999 || price < 0 || price > MAX_TOTAL) {
        return new Response(JSON.stringify({ error: "Item con valores inválidos" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const productName = sanitizeString(item.product_name, 200);
      if (!productName) {
        return new Response(JSON.stringify({ error: "Nombre de producto requerido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      calculatedSubtotal += quantity * price;
      sanitizedItems.push({
        product_id: item.product_id ? sanitizeUUID(item.product_id) : null,
        product_name: productName,
        product_image: sanitizeString(item.product_image, 500) || "/placeholder.svg",
        selected_color: item.selected_color ? sanitizeString(item.selected_color, 50) : null,
        quantity,
        price,
      });
    }

    // Verify subtotal matches items (allow small drift)
    if (Math.abs(calculatedSubtotal - subtotal) > 0.02 * sanitizedItems.length) {
      console.warn("[create-order] Subtotal mismatch", { calculatedSubtotal, subtotal });
    }

    // Determine status
    const statusMap: Record<string, string> = {
      mercadopago: "awaiting_payment",
    };
    const status = body.status && typeof body.status === "string" 
      ? sanitizeString(body.status, 30)
      : statusMap[payment_method] || "pending";

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        payment_method,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status,
      })
      .select("id, payment_method, total")
      .single();

    if (orderError || !order) {
      console.error("[create-order] orders insert error", orderError);
      return new Response(
        JSON.stringify({ error: orderError?.message ?? "No se pudo crear el pedido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const orderItems = sanitizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      selected_color: item.selected_color,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems as unknown as Json);
    if (itemsError) {
      console.error("[create-order] order_items insert error", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: itemsError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    try {
      await supabase.from("security_audit_log").insert({
        user_id: user_id,
        action: "order_created",
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        details: { order_id: order.id, store_id, total },
      });
    } catch (e) {
      console.warn("[create-order] audit log failed", e);
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
