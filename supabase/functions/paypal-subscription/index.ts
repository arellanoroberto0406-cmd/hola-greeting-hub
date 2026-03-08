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

// Create a PayPal Product (required before creating plans)
async function ensurePayPalProduct(accessToken: string): Promise<string> {
  // Try to list existing products first
  const listRes = await fetch(`${PAYPAL_API_URL}/v1/catalogs/products?page_size=1`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  })
  const listData = await listRes.json()
  if (listData.products && listData.products.length > 0) {
    return listData.products[0].id
  }

  // Create a product
  const res = await fetch(`${PAYPAL_API_URL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `product-${Date.now()}`,
    },
    body: JSON.stringify({
      name: 'Suscripción Tienda Online',
      description: 'Plan de suscripción para tu tienda en línea',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create PayPal product: ${err}`)
  }
  const product = await res.json()
  return product.id
}

// Create a PayPal Billing Plan
async function createPayPalBillingPlan(
  accessToken: string,
  productId: string,
  planName: string,
  amount: number,
  currency: string,
  cycle: 'monthly' | 'yearly'
): Promise<string> {
  const intervalUnit = cycle === 'yearly' ? 'YEAR' : 'MONTH'
  
  const res = await fetch(`${PAYPAL_API_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `plan-${planName}-${cycle}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: `${planName} - ${cycle === 'yearly' ? 'Anual' : 'Mensual'}`,
      description: `Suscripción ${planName} con cobro automático ${cycle === 'yearly' ? 'anual' : 'mensual'}`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: intervalUnit, interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // infinite
          pricing_scheme: {
            fixed_price: { value: amount.toFixed(2), currency_code: currency },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create PayPal billing plan: ${err}`)
  }
  const plan = await res.json()
  return plan.id
}

// Validate an existing PayPal Billing Plan before reusing it
async function getPayPalBillingPlan(
  accessToken: string,
  paypalPlanId: string
): Promise<{ status?: string; billing_cycles?: Array<{ pricing_scheme?: { fixed_price?: { value?: string; currency_code?: string } } }> } | null> {
  const res = await fetch(`${PAYPAL_API_URL}/v1/billing/plans/${paypalPlanId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    console.warn(`Could not validate PayPal plan ${paypalPlanId} (${res.status}):`, err)
    return null
  }

  return await res.json()
}

// Create a PayPal Subscription
async function createPayPalSubscription(
  accessToken: string,
  paypalPlanId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const res = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `sub-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: paypalPlanId,
      application_context: {
        brand_name: 'Tu Tienda Online',
        locale: 'es-MX',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`PayPal subscription creation failed (${res.status}):`, err)
    throw new Error(`Failed to create PayPal subscription: ${err}`)
  }
  const sub = await res.json()
  console.log('PayPal subscription created:', sub.id, 'Status:', sub.status)
  const approvalUrl = sub.links?.find((l: { rel: string }) => l.rel === 'approve')?.href
  if (!approvalUrl) {
    console.error('No approval URL in response:', JSON.stringify(sub.links))
    throw new Error('PayPal did not return an approval URL')
  }
  return { subscriptionId: sub.id, approvalUrl }
}

// Get PayPal subscription details
async function getPayPalSubscription(accessToken: string, subscriptionId: string) {
  const res = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get subscription: ${err}`)
  }
  return await res.json()
}

// Cancel PayPal subscription
async function cancelPayPalSubscription(accessToken: string, subscriptionId: string, reason: string) {
  const res = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to cancel subscription: ${err}`)
  }
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

    // ========== REDIRECT: User returns from PayPal after approving subscription ==========
    if (action === 'activate') {
      const subscriptionId = url.searchParams.get('subscription_id')
      if (!subscriptionId) {
        return new Response('<html><body><h1>Error: subscription_id missing</h1></body></html>', {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400,
        })
      }

      // Get pending order
      const { data: pendingOrder } = await supabase
        .from('paypal_pending_orders')
        .select('*')
        .eq('paypal_order_id', subscriptionId)
        .single()

      if (!pendingOrder) {
        return new Response('<html><body><h1>Error: Pending order not found</h1></body></html>', {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 404,
        })
      }

      // Verify subscription is active on PayPal
      const accessToken = await getPayPalAccessToken()
      const subDetails = await getPayPalSubscription(accessToken, subscriptionId)
      console.log('PayPal subscription status:', subDetails.status)

      if (subDetails.status === 'ACTIVE' || subDetails.status === 'APPROVED') {
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
          payment_reference: subscriptionId,
          paypal_subscription_id: subscriptionId,
          auto_renew: true,
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
        await supabase.from('paypal_pending_orders').delete().eq('paypal_order_id', subscriptionId)

        console.log(`Recurring subscription activated for store ${pendingOrder.store_id}`)

        const baseUrl = Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app'
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, 'Location': `${baseUrl}/dashboard?payment=success` },
        })
      }

      return new Response('<html><body><h1>Subscription not yet active. Please try again.</h1></body></html>', {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }, status: 400,
      })
    }

    // ========== REDIRECT: User cancelled ==========
    if (action === 'cancel') {
      const subscriptionId = url.searchParams.get('subscription_id')
      if (subscriptionId) {
        await supabase.from('paypal_pending_orders').delete().eq('paypal_order_id', subscriptionId)
      }
      const baseUrl = Deno.env.get('SITE_URL') || 'https://apptienda.lovable.app'
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, 'Location': `${baseUrl}/dashboard?payment=cancelled` },
      })
    }

    // ========== WEBHOOK: PayPal sends events (payment completed, subscription cancelled, etc.) ==========
    if (action === 'webhook') {
      const event = await req.json()
      console.log('PayPal webhook event:', event.event_type, JSON.stringify(event.resource?.id))

      const eventType = event.event_type
      const resource = event.resource

      if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        // Subscription activated - already handled in redirect, but good as backup
        console.log('Subscription activated via webhook:', resource.id)
      }

      if (eventType === 'PAYMENT.SALE.COMPLETED') {
        // Recurring payment received!
        const subscriptionId = resource.billing_agreement_id
        if (subscriptionId) {
          console.log(`Recurring payment received for subscription ${subscriptionId}`)
          
          // Find the store subscription
          const { data: storeSub } = await supabase
            .from('store_subscriptions')
            .select('*')
            .eq('paypal_subscription_id', subscriptionId)
            .single()

          if (storeSub) {
            const newEnd = new Date()
            // Determine cycle from current subscription
            const currentStart = new Date(storeSub.subscription_start_date || new Date())
            const currentEnd = new Date(storeSub.subscription_end_date || new Date())
            const diffDays = (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
            const isYearly = diffDays > 60

            if (isYearly) {
              newEnd.setFullYear(newEnd.getFullYear() + 1)
            } else {
              newEnd.setMonth(newEnd.getMonth() + 1)
            }

            await supabase
              .from('store_subscriptions')
              .update({
                status: 'active',
                last_payment_date: new Date().toISOString(),
                subscription_end_date: newEnd.toISOString(),
                next_payment_date: newEnd.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', storeSub.id)

            console.log(`Subscription renewed for store ${storeSub.store_id} until ${newEnd.toISOString()}`)
          }
        }
      }

      if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
        const subscriptionId = resource.id
        const { data: storeSub } = await supabase
          .from('store_subscriptions')
          .select('id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (storeSub) {
          await supabase
            .from('store_subscriptions')
            .update({ auto_renew: false, status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', storeSub.id)
          console.log(`Subscription cancelled for PayPal sub ${subscriptionId}`)
        }
      }

      if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
        const subscriptionId = resource.id
        const { data: storeSub } = await supabase
          .from('store_subscriptions')
          .select('id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (storeSub) {
          await supabase
            .from('store_subscriptions')
            .update({ status: 'pending_renewal', updated_at: new Date().toISOString() })
            .eq('id', storeSub.id)
          console.log(`Payment failed for PayPal sub ${subscriptionId}`)
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ========== API: Create subscription (called from frontend) ==========
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

    if (bodyAction === 'create-subscription') {
      console.log(`Creating recurring subscription for store ${storeId}, plan ${planId}, cycle ${billingCycle}`)

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()
      if (planError || !plan) throw new Error('Plan not found')

      const { data: store } = await supabase
        .from('stores')
        .select('currency')
        .eq('id', storeId)
        .single()

      // Always use USD for PayPal subscriptions (most universally supported)
      const currency = 'USD'
      const amount = billingCycle === 'yearly' && plan.price_yearly ? plan.price_yearly : plan.price_monthly
      console.log(`Creating plan with currency: ${currency}, amount: ${amount}`)

      const accessToken = await getPayPalAccessToken()

      // Check if we already have a PayPal billing plan for this plan+cycle
      let { data: billingPlan } = await supabase
        .from('paypal_billing_plans')
        .select('id, paypal_plan_id')
        .eq('subscription_plan_id', planId)
        .eq('billing_cycle', billingCycle)
        .eq('is_active', true)
        .single()

      let paypalPlanId: string
      let shouldCreateNewPlan = false

      if (billingPlan?.paypal_plan_id) {
        const planDetails = await getPayPalBillingPlan(accessToken, billingPlan.paypal_plan_id)
        const existingStatus = planDetails?.status
        const existingPrice = planDetails?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.value
        const existingCurrency = planDetails?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.currency_code
        const expectedPrice = amount.toFixed(2)

        if (!planDetails || existingStatus !== 'ACTIVE' || existingPrice !== expectedPrice || existingCurrency !== currency) {
          console.log(
            `Stored PayPal plan invalid for reuse (status=${existingStatus ?? 'unknown'}, price=${existingPrice ?? 'unknown'}, currency=${existingCurrency ?? 'unknown'}). Creating a new plan.`
          )
          shouldCreateNewPlan = true

          if (billingPlan.id) {
            await supabase
              .from('paypal_billing_plans')
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq('id', billingPlan.id)
          }
        } else {
          paypalPlanId = billingPlan.paypal_plan_id
          console.log(`Using existing valid PayPal plan: ${paypalPlanId}`)
        }
      } else {
        shouldCreateNewPlan = true
      }

      if (shouldCreateNewPlan) {
        // Create product and billing plan on PayPal
        const productId = await ensurePayPalProduct(accessToken)
        paypalPlanId = await createPayPalBillingPlan(accessToken, productId, plan.name, amount, currency, billingCycle)
        console.log(`Created new PayPal plan: ${paypalPlanId}`)

        // Save for reuse
        await supabase.from('paypal_billing_plans').insert({
          subscription_plan_id: planId,
          paypal_plan_id: paypalPlanId,
          billing_cycle: billingCycle,
        })
      }

      // Create PayPal subscription
      const functionsUrl = `${supabaseUrl}/functions/v1/paypal-subscription`
      const { subscriptionId, approvalUrl } = await createPayPalSubscription(
        accessToken,
        paypalPlanId,
        `${functionsUrl}?action=activate`,
        `${functionsUrl}?action=cancel`
      )

      // Save pending order (reuse existing table, use subscriptionId as paypal_order_id)
      await supabase.from('paypal_pending_orders').upsert({
        paypal_order_id: subscriptionId,
        store_id: storeId,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount,
        created_at: new Date().toISOString(),
      })

      return new Response(
        JSON.stringify({ subscriptionId, approvalUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== API: Cancel subscription ==========
    if (bodyAction === 'cancel-subscription') {
      const { data: storeSub } = await supabase
        .from('store_subscriptions')
        .select('paypal_subscription_id')
        .eq('store_id', storeId)
        .single()

      if (storeSub?.paypal_subscription_id) {
        const accessToken = await getPayPalAccessToken()
        await cancelPayPalSubscription(accessToken, storeSub.paypal_subscription_id, 'User requested cancellation')
        
        await supabase
          .from('store_subscriptions')
          .update({ auto_renew: false, updated_at: new Date().toISOString() })
          .eq('store_id', storeId)

        console.log(`Subscription cancelled for store ${storeId}`)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== Legacy: create-order (keep backward compat) ==========
    if (body.action === 'create-order') {
      // Redirect to new subscription flow
      const newBody = { ...body, action: undefined }
      return new Response(
        JSON.stringify({ error: 'Please use create-subscription action for recurring billing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ error: `Invalid action: ${String(bodyAction ?? 'none')}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('PayPal subscription error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
