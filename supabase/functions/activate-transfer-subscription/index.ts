import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

async function computeFileHash(url: string): Promise<string> {
  try {
    const resp = await fetch(url)
    const buf = await resp.arrayBuffer()
    const hash = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return `fallback-${Date.now()}-${Math.random()}`
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

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Admin approve/reject action
    if (action === 'review') {
      // Verify admin role
      const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'No tienes permisos de administrador' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { proofId, decision, notes } = await req.json()
      if (!proofId || !decision || !['approved', 'rejected'].includes(decision)) {
        return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Get proof details
      const { data: proof, error: proofError } = await supabase
        .from('subscription_payment_proofs')
        .select('*')
        .eq('id', proofId)
        .single()

      if (proofError || !proof) {
        return new Response(JSON.stringify({ error: 'Comprobante no encontrado' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (proof.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Este comprobante ya fue revisado' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Update proof status
      await supabase
        .from('subscription_payment_proofs')
        .update({
          status: decision,
          notes: notes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', proofId)

      // If approved, activate subscription + generate activation code receipt
      let activationCode: string | null = null
      if (decision === 'approved') {
        const now = new Date()
        const endDate = new Date()
        const durationDays = proof.billing_cycle === 'yearly' ? 365 : 30
        if (proof.billing_cycle === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1)
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
        }

        // Generate unique activation code: ACT-XXXXXXXX
        const genCode = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
          let s = ''
          for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
          return `ACT-${s}`
        }
        let code = genCode()
        // Ensure uniqueness (retry up to 5 times)
        for (let i = 0; i < 5; i++) {
          const { data: exists } = await supabase
            .from('subscription_activation_codes')
            .select('id')
            .eq('code', code)
            .maybeSingle()
          if (!exists) break
          code = genCode()
        }
        activationCode = code

        // Insert pre-redeemed code as receipt
        const { data: codeRow, error: codeErr } = await supabase
          .from('subscription_activation_codes')
          .insert({
            code,
            plan_id: proof.plan_id,
            billing_cycle: proof.billing_cycle || 'monthly',
            duration_days: durationDays,
            max_uses: 1,
            used_count: 1,
            is_active: false,
            notes: `Auto-generado al aprobar comprobante ${proof.id}`,
            created_by: user.id,
          })
          .select('id')
          .single()

        if (codeErr) console.error('Code insert error:', codeErr)

        if (codeRow) {
          await supabase.from('subscription_code_redemptions').insert({
            code_id: codeRow.id,
            store_id: proof.store_id,
            redeemed_by: user.id,
          })
        }

        const subData = {
          status: 'active',
          plan_id: proof.plan_id,
          payment_method: 'transfer',
          payment_reference: activationCode || `transfer-${Date.now()}`,
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
          .eq('store_id', proof.store_id)
          .single()

        if (existing) {
          await supabase.from('store_subscriptions').update(subData).eq('store_id', proof.store_id)
        } else {
          await supabase.from('store_subscriptions').insert({ store_id: proof.store_id, ...subData })
        }

        console.log(`Transfer subscription approved for store ${proof.store_id}, plan ${proof.plan_id}, code ${activationCode}`)
      } else {
        console.log(`Transfer subscription rejected for store ${proof.store_id}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: decision === 'approved' ? 'Plan activado' : 'Comprobante rechazado',
          activationCode,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: submit proof (store owner)
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

    // Check for existing pending proof
    const { data: existingPending } = await supabase
      .from('subscription_payment_proofs')
      .select('id')
      .eq('store_id', storeId)
      .eq('status', 'pending')
      .limit(1)

    if (existingPending && existingPending.length > 0) {
      return new Response(JSON.stringify({ error: 'Ya tienes un comprobante pendiente de revisión. Espera a que sea revisado.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Compute file hash to prevent duplicates
    const fileHash = await computeFileHash(proofUrl)

    // Check for duplicate file
    const { data: duplicateProof } = await supabase
      .from('subscription_payment_proofs')
      .select('id, status')
      .eq('file_hash', fileHash)
      .limit(1)

    if (duplicateProof && duplicateProof.length > 0) {
      return new Response(JSON.stringify({ error: 'Este comprobante ya fue utilizado anteriormente. Sube un comprobante diferente.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Save payment proof as PENDING (not auto-approved)
    const { error: insertError } = await supabase.from('subscription_payment_proofs').insert({
      store_id: storeId,
      plan_id: planId,
      billing_cycle: billingCycle || 'monthly',
      amount,
      proof_url: proofUrl,
      status: 'pending',
      file_hash: fileHash,
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Error al guardar el comprobante' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Transfer proof submitted for store ${storeId}, plan ${planId} — awaiting review`)

    return new Response(
      JSON.stringify({ success: true, message: 'Comprobante enviado. Tu plan será activado una vez que se verifique el pago.' }),
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
