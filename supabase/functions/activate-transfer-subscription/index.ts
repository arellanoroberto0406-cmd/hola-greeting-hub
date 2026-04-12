import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { storeId, planId, billingCycle, amount, proofUrl } = await req.json()

    if (!storeId || !planId || !proofUrl || !amount) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify store ownership
    const { data: store } = await supabase
      .from('stores')
      .select('id, owner_id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single()

    if (!store) {
      return new Response(JSON.stringify({ error: 'No tienes permiso para esta tienda' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save payment proof
    await supabase.from('subscription_payment_proofs').insert({
      store_id: storeId,
      plan_id: planId,
      billing_cycle: billingCycle || 'monthly',
      amount,
      proof_url: proofUrl,
      status: 'approved', // Auto-approve on upload
    })

    // Activate subscription
    const now = new Date()
    const endDate = new Date()
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const subData = {
      status: 'active',
      plan_id: planId,
      payment_method: 'transfer',
      payment_reference: `transfer-${Date.now()}`,
      paypal_subscription_id: null,
      auto_renew: false,
      subscription_start_date: now.toISOString(),
      subscription_end_date: endDate.toISOString(),
      last_payment_date: now.toISOString(),
      next_payment_date: endDate.toISOString(),
    }

    const { data: existing } = await supabase
      .from('store_subscriptions')
      .select('id')
      .eq('store_id', storeId)
      .single()

    if (existing) {
      await supabase.from('store_subscriptions').update(subData).eq('store_id', storeId)
    } else {
      await supabase.from('store_subscriptions').insert({ store_id: storeId, ...subData })
    }

    console.log(`Transfer subscription activated for store ${storeId}, plan ${planId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Plan activado exitosamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Transfer activation error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
