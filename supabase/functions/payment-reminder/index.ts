import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find transfer orders older than 4 hours that are still pending and have no payment proof
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: pendingOrders, error } = await supabase
      .from('orders')
      .select('id, email, first_name, total, created_at, store_id, payment_proof_url, stores:store_id(name, whatsapp_number, email)')
      .eq('payment_method', 'transfer')
      .in('status', ['pending', 'awaiting_payment'])
      .is('payment_proof_url', null)
      .lt('created_at', fourHoursAgo)
      .gt('created_at', twentyFourHoursAgo) // Don't remind orders older than 24h

    if (error) {
      console.error('Error fetching pending orders:', error)
      throw error
    }

    console.log(`Found ${pendingOrders?.length || 0} pending transfer orders to remind`)

    const results: { orderId: string; notified: boolean; method: string }[] = []

    for (const order of pendingOrders || []) {
      const store = (order as any).stores
      const storeName = store?.name || 'La tienda'
      const storeWhatsapp = store?.whatsapp_number

      // Notify store owner via WhatsApp if available
      if (storeWhatsapp) {
        const cleanNumber = storeWhatsapp.replace(/\D/g, '')
        const message = `⏰ Recordatorio: El pedido #${order.id.slice(0, 8).toUpperCase()} de ${order.first_name} ($${order.total}) está pendiente de pago por transferencia desde hace más de 4 horas. Aún no se ha recibido comprobante.`
        
        console.log(`Would send WhatsApp reminder to ${cleanNumber} for order ${order.id.slice(0, 8)}`)
        results.push({ orderId: order.id, notified: true, method: 'whatsapp_logged' })
      }

      // Update order status to flag it
      await supabase
        .from('orders')
        .update({ status: 'awaiting_payment' })
        .eq('id', order.id)
        .eq('status', 'pending')

      results.push({ orderId: order.id, notified: true, method: 'status_updated' })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingOrders?.length || 0,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Payment reminder error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
