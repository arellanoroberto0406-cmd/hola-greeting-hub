import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const ID_RE = /^[a-zA-Z0-9_-]+$/;

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !ID_RE.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
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
    const body = await req.json();
    const { priceId, storeId, planId, billingCycle, returnUrl, environment } = body ?? {};

    if (typeof priceId !== 'string' || !ID_RE.test(priceId)) {
      throw new Error("priceId inválido");
    }
    if (environment !== 'sandbox' && environment !== 'live') {
      throw new Error("environment inválido");
    }
    if (typeof returnUrl !== 'string' || !returnUrl.startsWith('http')) {
      throw new Error("returnUrl inválido");
    }
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      throw new Error("billingCycle inválido");
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token ?? '');
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The store must belong to the signed-in user.
    const { data: store } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .maybeSingle();
    if (!store || store.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Tienda no válida' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('id', planId)
      .maybeSingle();
    if (!plan) throw new Error("Plan no encontrado");

    const stripe = createStripeClient(environment as StripeEnv);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) throw new Error("Precio no encontrado");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === 'recurring';

    const customerId = await resolveOrCreateCustomer(stripe, {
      email: user.email ?? undefined,
      userId: user.id,
    });

    const metadata = {
      userId: user.id,
      storeId: String(storeId),
      planId: String(planId),
      billingCycle: String(billingCycle),
      managed_payments: 'false',
    };

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? 'subscription' : 'payment',
      ui_mode: 'embedded_page',
      return_url: returnUrl,
      customer: customerId,
      automatic_tax: { enabled: true },
      metadata,
      ...(isRecurring && { subscription_data: { metadata } }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-checkout error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
