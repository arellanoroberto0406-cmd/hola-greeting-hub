import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

function periodEndOf(subscription: any): Date {
  const item = subscription.items?.data?.[0];
  const end = item?.current_period_end ?? subscription.current_period_end;
  if (end) return new Date(end * 1000);
  const days = subscription.metadata?.billingCycle === 'yearly' ? 365 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function activateStorePlan(subscription: any, statusOverride?: string) {
  const storeId = subscription.metadata?.storeId;
  const planId = subscription.metadata?.planId;
  if (!storeId || !planId) {
    console.log('Suscripción sin storeId/planId en metadata, se ignora');
    return;
  }

  const stripeStatus: string = statusOverride ?? subscription.status;
  const status = ['active', 'trialing'].includes(stripeStatus)
    ? 'active'
    : stripeStatus === 'past_due'
      ? 'past_due'
      : 'cancelled';

  const endDate = periodEndOf(subscription);
  const payload = {
    store_id: storeId,
    plan_id: planId,
    status,
    payment_method: 'card',
    payment_reference: subscription.id,
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: endDate.toISOString(),
    last_payment_date: new Date().toISOString(),
    next_payment_date: endDate.toISOString(),
    auto_renew: !subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('store_subscriptions')
    .select('id')
    .eq('store_id', storeId)
    .maybeSingle();

  if (existing) {
    await supabase.from('store_subscriptions').update(payload).eq('store_id', storeId);
  } else {
    await supabase.from('store_subscriptions').insert(payload);
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await activateStorePlan(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await activateStorePlan(event.data.object, 'canceled');
      break;
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.payment_status !== 'unpaid' && session.metadata?.storeId) {
        console.log('Checkout completado para tienda', session.metadata.storeId);
      }
      break;
    }
    default:
      console.log('Evento no manejado:', event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const rawEnv = new URL(req.url).searchParams.get('env');
  if (rawEnv !== 'sandbox' && rawEnv !== 'live') {
    return new Response(JSON.stringify({ received: true, ignored: 'invalid env' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    await handleWebhook(req, rawEnv);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
