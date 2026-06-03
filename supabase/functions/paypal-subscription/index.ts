import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')!
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'live'
const PAYPAL_API_URL = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

console.log('PayPal environment selected:', PAYPAL_MODE === 'sandbox' ? 'sandbox' : 'live')

async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get PayPal access token: ${error}`)
  }
  const data = await response.json()
  return data.access_token
}

function mapPayPalErrorForClient(errorText: string) {
  const debugIdMatch = errorText.match(/"debug_id"\s*:\s*"([^"]+)"/i)
  const debugId = debugIdMatch?.[1] ?? null

  if (errorText.includes('PAYEE_ACCOUNT_RESTRICTED')) {
    return {
      error: 'La cuenta de PayPal del comerciante está restringida. Resuélvelo en PayPal para poder cobrar.',
      errorCode: 'PAYEE_ACCOUNT_RESTRICTED',
      debugId,
      technicalDetails: errorText,
    }
  }
  if (errorText.includes('CURRENCY_NOT_SUPPORTED') || errorText.includes('CURRENCY_NOT_SUPPORTED_FOR_RECEIVER')) {
    return {
      error: 'La moneda MXN no está habilitada en la cuenta de PayPal del comerciante. Habilítala desde PayPal.',
      errorCode: 'CURRENCY_NOT_SUPPORTED',
      debugId,
      technicalDetails: errorText,
    }
  }
  if (errorText.includes('PERMISSION_DENIED') || errorText.includes('AUTHENTICATION_FAILURE')) {
    return {
      error: 'Error de autenticación con PayPal. Verifica las credenciales del servidor.',
      errorCode: 'PAYPAL_AUTH_ERROR',
      debugId,
      technicalDetails: errorText,
    }
  }
  return {
    error: 'No se pudo procesar el pago con PayPal. Intenta de nuevo.',
    errorCode: 'PAYPAL_API_ERROR',
    debugId,
    technicalDetails: errorText,
  }
}

// ========== PayPal Orders API v2 (one-time payment) ==========

async function createPayPalOrder(
  accessToken: string,
  amount: number,
  currency: string,
  description: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ orderId: string; approvalUrl: string }> {
  const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `order-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
        },
      ],
      application_context: {
        brand_name: 'Tu Tienda Online',
        locale: 'es-MX',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`PayPal order creation failed (${res.status}):`, err)
    const mapped = mapPayPalErrorForClient(err)
    throw new Error(JSON.stringify(mapped))
  }

  const order = await res.json()
  console.log('PayPal order created:', order.id, 'Status:', order.status)

  const approvalUrl = order.links?.find((l: { rel: string }) => l.rel === 'approve')?.href
  if (!approvalUrl) {
    console.error('No approval URL in response:', JSON.stringify(order.links))
    throw new Error('PayPal did not return an approval URL')
  }

  return { orderId: order.id, approvalUrl }
}

async function capturePayPalOrder(accessToken: string, orderId: string) {
  const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`PayPal capture failed (${res.status}):`, err)
    throw new Error(`Failed to capture PayPal order: ${err}`)
  }

  return await res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // ========== REDIRECT: User returns from PayPal after paying ==========
    if (action === 'capture') {
      const token = url.searchParams.get('token') // PayPal passes the order ID as "token"
      if (!token) {
        return new Response('<html><body><h1>Error: order token missing</h1></body></html>', {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400,
        })
      }

      // Get pending order from DB
      const { data: pendingOrder } = await supabase
        .from('paypal_pending_orders')
        .select('*')
        .eq('paypal_order_id', token)
        .single()

      if (!pendingOrder) {
        return new Response('<html><body><h1>Error: Pending order not found</h1></body></html>', {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 404,
        })
      }

      // Capture the payment
      const accessToken = await getPayPalAccessToken()
      const captureResult = await capturePayPalOrder(accessToken, token)
      console.log('PayPal capture result:', captureResult.status)

      if (captureResult.status === 'COMPLETED') {
        const now = new Date()
        const endDate = new Date()
        if (pendingOrder.billing_cycle === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }

        // Upsert subscription
        const { data: existing } = await supabase
          .from('store_subscriptions')
          .select('id')
          .eq('store_id', pendingOrder.store_id)
          .single()

        const subData = {
          status: 'active',
          plan_id: pendingOrder.plan_id,
          payment_method: 'paypal',
          payment_reference: token,
          paypal_subscription_id: null, // no recurring subscription
          auto_renew: false,
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          last_payment_date: now.toISOString(),
          next_payment_date: endDate.toISOString(),
        }

        if (existing) {
          await supabase.from('store_subscriptions').update(subData).eq('store_id', pendingOrder.store_id)
        } else {
          await supabase.from('store_subscriptions').insert({ store_id: pendingOrder.store_id, ...subData })
        }

        // Clean up pending order
        await supabase.from('paypal_pending_orders').delete().eq('paypal_order_id', token)

        console.log(`Payment captured and plan activated for store ${pendingOrder.store_id}`)

        const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'https://apptienda.lovable.app'
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, 'Location': `${baseUrl}/dashboard?payment=success` },
        })
      }

      return new Response(`<html><body><h1>Payment not completed. Status: ${captureResult.status}</h1></body></html>`, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400,
      })
    }

    // ========== REDIRECT: User cancelled ==========
    if (action === 'cancel') {
      const token = url.searchParams.get('token')
      if (token) {
        await supabase.from('paypal_pending_orders').delete().eq('paypal_order_id', token)
      }
      const baseUrl = Deno.env.get('SITE_URL') || req.headers.get('origin') || 'https://apptienda.lovable.app'
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${baseUrl}/dashboard?payment=cancelled` },
      })
    }

    // ========== API: Create one-time order (called from frontend) ==========
    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { action: bodyAction, planId, storeId, billingCycle = 'monthly' } = body as {
      action?: string
      planId?: string
      storeId?: string
      billingCycle?: 'monthly' | 'yearly'
    }

    console.log('Incoming request action:', bodyAction ?? 'none', '| storeId:', storeId ?? 'none', '| planId:', planId ?? 'none')

    if (bodyAction === 'create-subscription' || bodyAction === 'create-order') {
      console.log(`Creating one-time PayPal order for store ${storeId}, plan ${planId}, cycle ${billingCycle}`)

      if (!storeId || !planId) {
        return new Response(
          JSON.stringify({ error: 'Faltan datos: storeId o planId', errorCode: 'INVALID_REQUEST' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Server-side price lookup — never trust client amount
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single()
      if (planError || !plan) {
        return new Response(
          JSON.stringify({ error: 'Plan no encontrado o inactivo', errorCode: 'PLAN_NOT_FOUND' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Prices in DB are MXN — charge in MXN to match what the user sees
      const currency = 'MXN'
      const rawAmount = billingCycle === 'yearly' && plan.price_yearly
        ? Number(plan.price_yearly)
        : Number(plan.price_monthly)
      if (!rawAmount || rawAmount <= 0 || !Number.isFinite(rawAmount)) {
        return new Response(
          JSON.stringify({ error: 'Precio del plan inválido', errorCode: 'INVALID_PRICE' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const amount = Math.round(rawAmount * 100) / 100
      console.log(`Creating order with currency: ${currency}, amount: ${amount}`)

      const accessToken = await getPayPalAccessToken()

      const functionsUrl = `${supabaseUrl}/functions/v1/paypal-subscription`
      const { orderId, approvalUrl } = await createPayPalOrder(
        accessToken,
        amount,
        currency,
        `Plan ${plan.name} - ${billingCycle === 'yearly' ? 'Anual' : 'Mensual'}`,
        `${functionsUrl}?action=capture`,
        `${functionsUrl}?action=cancel`
      )

      // Save pending order (idempotent upsert)
      const { error: pendingError } = await supabase.from('paypal_pending_orders').upsert({
        paypal_order_id: orderId,
        store_id: storeId,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount,
        created_at: new Date().toISOString(),
      }, { onConflict: 'paypal_order_id' })

      if (pendingError) {
        console.error('Failed to save pending order:', pendingError)
      }

      return new Response(
        JSON.stringify({ subscriptionId: orderId, approvalUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== API: Cancel subscription (legacy - just update DB) ==========
    if (bodyAction === 'cancel-subscription') {
      await supabase
        .from('store_subscriptions')
        .update({ auto_renew: false, status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('store_id', storeId)

      console.log(`Subscription cancelled for store ${storeId}`)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: `Invalid action: ${String(bodyAction ?? 'none')}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('PayPal payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    let clientError = {
      error: errorMessage,
      errorCode: 'PAYPAL_UNKNOWN_ERROR',
      debugId: null as string | null,
      technicalDetails: errorMessage,
    }

    try {
      const parsed = JSON.parse(errorMessage)
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        clientError = {
          error: String((parsed as { error: unknown }).error),
          errorCode: String((parsed as { errorCode?: unknown }).errorCode ?? 'PAYPAL_UNKNOWN_ERROR'),
          debugId: (parsed as { debugId?: string | null }).debugId ?? null,
          technicalDetails: String((parsed as { technicalDetails?: unknown }).technicalDetails ?? errorMessage),
        }
      }
    } catch {
      // Keep default clientError
    }

    return new Response(
      JSON.stringify(clientError),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
