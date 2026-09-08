import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const UUID_RE = /^[0-9a-fA-F-]{36}$/;

const ZERO_DECIMAL = new Set(["bif","clp","djf","gnf","jpy","kmf","krw","mga","pyg","rwf","ugx","vnd","vuv","xaf","xof","xpf"]);

function toMinorUnit(amount: number, currency: string): number {
  const c = currency.toLowerCase();
  return ZERO_DECIMAL.has(c) ? Math.round(amount) : Math.round(amount * 100);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { orderId, returnUrl, environment } = (await req.json()) ?? {};

    if (typeof orderId !== 'string' || !UUID_RE.test(orderId)) {
      throw new Error("Pedido inválido");
    }
    if (environment !== 'sandbox' && environment !== 'live') {
      throw new Error("environment inválido");
    }
    if (typeof returnUrl !== 'string' || !returnUrl.startsWith('http')) {
      throw new Error("returnUrl inválido");
    }

    // Amounts always come from the database, never from the browser.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_id, email, first_name, last_name, subtotal, shipping_cost, total, status')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) throw new Error("Pedido no encontrado");
    if (order.status === 'paid') throw new Error("Este pedido ya fue pagado");

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_name, quantity, price, selected_color')
      .eq('order_id', orderId);

    const { data: store } = await supabase
      .from('stores')
      .select('id, name, currency')
      .eq('id', order.store_id as string)
      .maybeSingle();

    const currency = ((store?.currency as string) || 'MXN').toLowerCase();

    const lineItems = (orderItems ?? []).map((item: any) => ({
      price_data: {
        currency,
        product_data: {
          name: item.selected_color
            ? `${item.product_name} (${item.selected_color})`
            : item.product_name,
        },
        unit_amount: toMinorUnit(Number(item.price), currency),
      },
      quantity: Number(item.quantity) || 1,
    }));

    if (!lineItems.length) throw new Error("El pedido no tiene productos");

    const shipping = Number(order.shipping_cost) || 0;
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency,
          product_data: { name: 'Envío' },
          unit_amount: toMinorUnit(shipping, currency),
        },
        quantity: 1,
      });
    }

    const stripe = createStripeClient(environment as StripeEnv);

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      ui_mode: 'embedded_page',
      return_url: returnUrl,
      customer_email: (order.email as string) || undefined,
      payment_intent_data: {
        description: `Pedido ${String(order.id).slice(0, 8)} · ${store?.name ?? 'Tienda'}`,
      },
      metadata: {
        kind: 'store_order',
        orderId: String(order.id),
        storeId: String(order.store_id),
      },
    });

    await supabase
      .from('orders')
      .update({ status: 'awaiting_payment', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-store-checkout error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
