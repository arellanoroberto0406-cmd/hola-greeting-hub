import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePreferenceRequest {
  storeId: string;
  orderId: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  paymentMethods?: {
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle webhook/IPN from MercadoPago
    if (action === 'webhook') {
      const body = await req.json();
      console.log('MercadoPago webhook received:', JSON.stringify(body));

      if (body.type === 'payment') {
        const paymentId = body.data?.id;
        
        // Get payment details from MercadoPago
        // First find the order to get the store's access token
        const { data: pendingPayment } = await supabase
          .from('mercadopago_payments')
          .select('*, stores(mercadopago_access_token)')
          .eq('mp_payment_id', paymentId)
          .single();

        if (pendingPayment && pendingPayment.stores?.mercadopago_access_token) {
          const accessToken = pendingPayment.stores.mercadopago_access_token;
          
          // Get payment status from MercadoPago
          const mpResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          
          const paymentData = await mpResponse.json();
          console.log('Payment status from MP:', paymentData.status);

          // Update order status based on payment status
          let orderStatus = 'pending';
          if (paymentData.status === 'approved') {
            orderStatus = 'paid';
          } else if (paymentData.status === 'rejected') {
            orderStatus = 'payment_failed';
          } else if (paymentData.status === 'in_process') {
            orderStatus = 'processing_payment';
          }

          await supabase
            .from('orders')
            .update({ 
              status: orderStatus,
              payment_method: `mercadopago_${paymentData.payment_type_id || 'unknown'}`,
            })
            .eq('id', pendingPayment.order_id);

          await supabase
            .from('mercadopago_payments')
            .update({ 
              status: paymentData.status,
              payment_type: paymentData.payment_type_id,
            })
            .eq('id', pendingPayment.id);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle preference creation (checkout)
    const body: CreatePreferenceRequest = await req.json();
    console.log('Creating MercadoPago preference for store:', body.storeId);

    // Get store's MercadoPago access token
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('mercadopago_access_token, name, slug')
      .eq('id', body.storeId)
      .single();

    if (storeError || !store) {
      console.error('Store not found:', storeError);
      return new Response(
        JSON.stringify({ error: 'Tienda no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!store.mercadopago_access_token) {
      console.error('Store has no MercadoPago token configured');
      return new Response(
        JSON.stringify({ error: 'MercadoPago no está configurado para esta tienda' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = store.mercadopago_access_token;

    // Create preference in MercadoPago
    const preferenceData = {
      items: body.items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'MXN',
      })),
      payer: {
        email: body.payer.email,
        name: body.payer.first_name,
        surname: body.payer.last_name,
      },
      back_urls: body.backUrls,
      auto_return: 'approved',
      external_reference: body.orderId,
      statement_descriptor: store.name?.substring(0, 22) || 'TIENDA',
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-payment?action=webhook`,
      payment_methods: body.paymentMethods || {
        installments: 12,
      },
    };

    console.log('Sending preference to MercadoPago:', JSON.stringify(preferenceData));

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    });

    const mpData = await mpResponse.json();
    console.log('MercadoPago response:', JSON.stringify(mpData));

    if (!mpResponse.ok) {
      console.error('MercadoPago error:', mpData);
      return new Response(
        JSON.stringify({ error: mpData.message || 'Error al crear preferencia de pago' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save the preference for tracking
    await supabase
      .from('mercadopago_payments')
      .insert({
        store_id: body.storeId,
        order_id: body.orderId,
        preference_id: mpData.id,
        status: 'pending',
      });

    return new Response(
      JSON.stringify({
        preferenceId: mpData.id,
        initPoint: mpData.init_point,
        sandboxInitPoint: mpData.sandbox_init_point,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in mercadopago-payment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
