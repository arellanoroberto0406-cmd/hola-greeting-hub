import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')!
// Change to sandbox for testing: 'https://api-m.sandbox.paypal.com'
const PAYPAL_API_URL = Deno.env.get('PAYPAL_MODE') === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com'

interface CreateOrderRequest {
  planId: string;
  storeId: string;
  billingCycle: 'monthly' | 'yearly';
  returnUrl?: string;
}

interface CaptureOrderRequest {
  orderId: string;
  storeId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
}

async function getPayPalAccessToken(): Promise<string> {
  console.log('Getting PayPal access token...');
  
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal token error:', error);
    throw new Error(`Failed to get PayPal access token: ${error}`);
  }

  const data = await response.json();
  console.log('PayPal access token obtained successfully');
  return data.access_token;
}

async function createPayPalOrder(
  accessToken: string, 
  amount: number, 
  currency: string,
  description: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  console.log(`Creating PayPal order for ${amount} ${currency}...`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description,
      }],
      application_context: {
        brand_name: 'Tu Tienda Online',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal create order error:', error);
    throw new Error(`Failed to create PayPal order: ${error}`);
  }

  const order = await response.json();
  const approvalUrl = order.links.find((link: { rel: string }) => link.rel === 'approve')?.href;
  
  console.log(`PayPal order created: ${order.id}`);
  
  return {
    id: order.id,
    approvalUrl,
  };
}

async function capturePayPalOrder(accessToken: string, orderId: string): Promise<{
  id: string;
  status: string;
  payer: { email_address: string };
}> {
  console.log(`Capturing PayPal order ${orderId}...`);
  
  const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal capture error:', error);
    throw new Error(`Failed to capture PayPal order: ${error}`);
  }

  const captureData = await response.json();
  console.log(`PayPal order captured: ${captureData.id}, status: ${captureData.status}`);
  
  return captureData;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle PayPal redirect after payment
    if (action === 'capture') {
      const orderId = url.searchParams.get('token'); // PayPal uses 'token' for order ID in redirects
      
      if (!orderId) {
        return new Response(
          '<html><body><h1>Error: Order ID missing</h1></body></html>',
          { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 }
        );
      }

      // Get pending order from our database
      const { data: pendingOrder } = await supabase
        .from('paypal_pending_orders')
        .select('*')
        .eq('paypal_order_id', orderId)
        .single();

      if (!pendingOrder) {
        return new Response(
          '<html><body><h1>Error: Order not found</h1></body></html>',
          { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 404 }
        );
      }

      // Capture the payment
      const accessToken = await getPayPalAccessToken();
      const captureResult = await capturePayPalOrder(accessToken, orderId);

      if (captureResult.status === 'COMPLETED') {
        // Calculate subscription end date
        const subscriptionEnd = new Date();
        if (pendingOrder.billing_cycle === 'yearly') {
          subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        } else {
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        }

        // Check if subscription exists
        const { data: existingSubscription } = await supabase
          .from('store_subscriptions')
          .select('id')
          .eq('store_id', pendingOrder.store_id)
          .single();

        if (existingSubscription) {
          // Update existing subscription
          await supabase
            .from('store_subscriptions')
            .update({
              status: 'active',
              plan_id: pendingOrder.plan_id,
              payment_method: 'paypal',
              payment_reference: captureResult.id,
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: subscriptionEnd.toISOString(),
              last_payment_date: new Date().toISOString(),
              next_payment_date: subscriptionEnd.toISOString(),
            })
            .eq('store_id', pendingOrder.store_id);
        } else {
          // Create new subscription
          await supabase
            .from('store_subscriptions')
            .insert({
              store_id: pendingOrder.store_id,
              plan_id: pendingOrder.plan_id,
              status: 'active',
              payment_method: 'paypal',
              payment_reference: captureResult.id,
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: subscriptionEnd.toISOString(),
              last_payment_date: new Date().toISOString(),
              next_payment_date: subscriptionEnd.toISOString(),
            });
        }

        // Delete pending order
        await supabase
          .from('paypal_pending_orders')
          .delete()
          .eq('paypal_order_id', orderId);

        console.log(`Subscription activated for store ${pendingOrder.store_id} until ${subscriptionEnd.toISOString()}`);

        // Get the return URL from pending order or use default
        const baseUrl = (pendingOrder as Record<string, unknown>).return_url as string || Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app';
        const redirectUrl = `${baseUrl}/dashboard?payment=success`;
        
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, 'Location': redirectUrl },
        });
      }

      return new Response(
        '<html><body><h1>Payment not completed</h1></body></html>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400 }
      );
    }

    if (action === 'cancel') {
      // Get the order ID to find the return URL
      const orderId = url.searchParams.get('token');
      let redirectUrl = `${Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app'}/dashboard?payment=cancelled`;
      
      if (orderId) {
        const { data: pendingOrder } = await supabase
          .from('paypal_pending_orders')
          .select('*')
          .eq('paypal_order_id', orderId)
          .single();
        
        if (pendingOrder && (pendingOrder as Record<string, unknown>).return_url) {
          redirectUrl = `${(pendingOrder as Record<string, unknown>).return_url}/dashboard?payment=cancelled`;
        }
        
        // Delete the pending order
        await supabase
          .from('paypal_pending_orders')
          .delete()
          .eq('paypal_order_id', orderId);
      }
      
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirectUrl },
      });
    }

    // Handle API requests
    const body = await req.json();
    const { action: bodyAction, planId, storeId, billingCycle = 'monthly', returnUrl } = body;

    if (bodyAction === 'create-order') {
      console.log(`Creating order for store ${storeId}, plan ${planId}, cycle ${billingCycle}`);

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found');
      }

      // Get store details for currency
      const { data: store } = await supabase
        .from('stores')
        .select('currency, name')
        .eq('id', storeId)
        .single();

      const amount = billingCycle === 'yearly' && plan.price_yearly 
        ? plan.price_yearly 
        : plan.price_monthly;

      const currency = store?.currency || 'USD';
      const supabaseFunctionsUrl = `${supabaseUrl}/functions/v1/paypal-subscription`;

      const accessToken = await getPayPalAccessToken();
      const order = await createPayPalOrder(
        accessToken,
        amount,
        currency,
        `Suscripción ${plan.name} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensual'}`,
        `${supabaseFunctionsUrl}?action=capture`,
        `${supabaseFunctionsUrl}?action=cancel`
      );

      // Save pending order with return URL
      await supabase
        .from('paypal_pending_orders')
        .upsert({
          paypal_order_id: order.id,
          store_id: storeId,
          plan_id: planId,
          billing_cycle: billingCycle,
          amount,
          created_at: new Date().toISOString(),
        });

      return new Response(
        JSON.stringify({ orderId: order.id, approvalUrl: order.approvalUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error: unknown) {
    console.error('PayPal subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
