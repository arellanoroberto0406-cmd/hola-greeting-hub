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

    // ========== REDIRECT: Capture after customer approves ==========
    if (action === 'capture') {
      const token = url.searchParams.get('token')
      if (!token) {
        return new Response('<html><body><h1>Error: order token missing</h1></body></html>', {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400,
        })
      }

      // Get the order info from our DB to know the store slug
      const { data: orderPayment } = await supabase
        .from('mercadopago_payments')
        .select('*, orders!inner(store_id, stores:store_id(slug))')
        .eq('preference_id', token)
        .eq('payment_type', 'paypal')
        .single()

      // Capture the payment
      const accessToken = await getPayPalAccessToken()
      const captureRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${token}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const captureResult = await captureRes.json()
      console.log('PayPal store capture result:', captureResult.status)

      let storeSlug = ''
      let orderId = ''

      if (orderPayment) {
        orderId = orderPayment.order_id
        const storeData = (orderPayment as any).orders?.stores
        storeSlug = storeData?.slug || ''

        if (captureResult.status === 'COMPLETED') {
          // Update payment record
          await supabase
            .from('mercadopago_payments')
            .update({
              status: 'approved',
              mp_payment_id: captureResult.id,
              updated_at: new Date().toISOString(),
            })
            .eq('preference_id', token)
            .eq('payment_type', 'paypal')

          // Update order status
          await supabase
            .from('orders')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', orderId)

          console.log(`PayPal payment captured for order ${orderId}`)
        } else {
          await supabase
            .from('mercadopago_payments')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('preference_id', token)
            .eq('payment_type', 'paypal')
        }
      }

      const baseUrl = Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app'
      const status = captureResult.status === 'COMPLETED' ? 'success' : 'failure'
      const redirectUrl = storeSlug
        ? `${baseUrl}/tienda/${storeSlug}/checkout?status=${status}&order=${orderId}`
        : `${baseUrl}?payment=${status}`

      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirectUrl },
      })
    }

    // ========== REDIRECT: Customer cancelled ==========
    if (action === 'cancel') {
      const token = url.searchParams.get('token')
      if (token) {
        await supabase
          .from('mercadopago_payments')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('preference_id', token)
          .eq('payment_type', 'paypal')
      }

      // Try to find the store slug for redirect
      let storeSlug = ''
      let orderId = ''
      if (token) {
        const { data: payment } = await supabase
          .from('mercadopago_payments')
          .select('order_id, orders!inner(store_id, stores:store_id(slug))')
          .eq('preference_id', token)
          .eq('payment_type', 'paypal')
          .single()
        if (payment) {
          orderId = payment.order_id
          storeSlug = (payment as any).orders?.stores?.slug || ''
        }
      }

      const baseUrl = Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app'
      const redirectUrl = storeSlug
        ? `${baseUrl}/tienda/${storeSlug}/checkout?status=failure&order=${orderId}`
        : `${baseUrl}`

      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': redirectUrl },
      })
    }

    // ========== API: Create PayPal order for store checkout ==========
    const body = await req.json()
    const { storeId, orderId, items, payer, totalAmount, currency = 'MXN' } = body as {
      storeId: string
      orderId: string
      items: { title: string; quantity: number; unit_price: number }[]
      payer: { email: string; first_name: string; last_name: string }
      totalAmount: number
      currency?: string
    }

    if (!storeId || !orderId || !totalAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: storeId, orderId, totalAmount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get store info to set payee
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('paypal_email, name, slug')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return new Response(
        JSON.stringify({ error: 'Tienda no encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!store.paypal_email) {
      return new Response(
        JSON.stringify({ error: 'Esta tienda no tiene PayPal configurado. Contacta al vendedor.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Creating PayPal order for store ${store.name}, payee: ${store.paypal_email}, amount: ${totalAmount} ${currency}`)

    const accessToken = await getPayPalAccessToken()
    const functionsUrl = `${supabaseUrl}/functions/v1/paypal-store-payment`

    // Build item breakdown for PayPal
    const itemBreakdown = items.map(item => ({
      name: item.title.substring(0, 127),
      quantity: String(item.quantity),
      unit_amount: {
        currency_code: currency,
        value: item.unit_price.toFixed(2),
      },
    }))

    const itemsTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    const shippingAmount = totalAmount - itemsTotal

    const purchaseUnit: Record<string, unknown> = {
      payee: {
        email_address: store.paypal_email,
      },
      amount: {
        currency_code: currency,
        value: totalAmount.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: currency,
            value: itemsTotal.toFixed(2),
          },
          ...(shippingAmount > 0 ? {
            shipping: {
              currency_code: currency,
              value: shippingAmount.toFixed(2),
            },
          } : {}),
        },
      },
      items: itemBreakdown,
      description: `Pedido en ${store.name}`,
    }

    const orderRes = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `store-order-${orderId}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [purchaseUnit],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: store.name,
              locale: 'es-MX',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              return_url: `${functionsUrl}?action=capture`,
              cancel_url: `${functionsUrl}?action=cancel`,
            },
          },
        },
      }),
    })

    if (!orderRes.ok) {
      const errText = await orderRes.text()
      console.error(`PayPal order creation failed (${orderRes.status}):`, errText)

      // Check for known errors
      if (errText.includes('PAYEE_ACCOUNT_RESTRICTED')) {
        const debugIdMatch = errText.match(/"debug_id"\s*:\s*"([^"]+)"/i)
        return new Response(
          JSON.stringify({
            error: 'La cuenta de PayPal del vendedor está restringida. Contacta al vendedor.',
            errorCode: 'PAYEE_ACCOUNT_RESTRICTED',
            debugId: debugIdMatch?.[1] ?? null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ error: 'No se pudo crear el pago con PayPal. Intenta otro método de pago.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const paypalOrder = await orderRes.json()
    console.log('PayPal store order created:', paypalOrder.id, 'Status:', paypalOrder.status)

    const approvalUrl = paypalOrder.links?.find((l: { rel: string }) => l.rel === 'payer-action')?.href
      || paypalOrder.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

    if (!approvalUrl) {
      console.error('No approval URL in response:', JSON.stringify(paypalOrder.links))
      return new Response(
        JSON.stringify({ error: 'PayPal no devolvió una URL de pago' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Save payment record (reusing mercadopago_payments table with payment_type = 'paypal')
    await supabase.from('mercadopago_payments').insert({
      store_id: storeId,
      order_id: orderId,
      preference_id: paypalOrder.id,
      payment_type: 'paypal',
      status: 'pending',
    })

    return new Response(
      JSON.stringify({ approvalUrl, paypalOrderId: paypalOrder.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('PayPal store payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
