import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RenewalResult {
  storeId: string;
  success: boolean;
  error?: string;
  newEndDate?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting subscription renewal check...');

    // Find subscriptions that are about to expire (within 3 days) or have expired
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data: subscriptions, error } = await supabase
      .from('store_subscriptions')
      .select('*')
      .eq('status', 'active')
      .not('subscription_end_date', 'is', null)
      .lte('subscription_end_date', threeDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to process`);

    const results: RenewalResult[] = [];

    // Mark active subscriptions near expiration as pending_renewal
    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        console.log(`Processing renewal for store: ${subscription.store_id}`);
        
        const { error: updateError } = await supabase
          .from('store_subscriptions')
          .update({
            status: 'pending_renewal',
            updated_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq('id', subscription.id);

        if (updateError) {
          results.push({
            storeId: subscription.store_id,
            success: false,
            error: updateError.message,
          });
        } else {
          results.push({
            storeId: subscription.store_id,
            success: true,
            newEndDate: subscription.subscription_end_date,
          });
        }
      }
    }

    // Also check for expired trials
    const { data: expiredTrials } = await supabase
      .from('store_subscriptions')
      .select('*')
      .eq('status', 'trial')
      .not('trial_end_date', 'is', null)
      .lt('trial_end_date', now.toISOString());

    if (expiredTrials && expiredTrials.length > 0) {
      console.log(`Found ${expiredTrials.length} expired trials`);
      
      for (const trial of expiredTrials) {
        const { error: updateError } = await supabase
          .from('store_subscriptions')
          .update({
            status: 'trial_expired',
            updated_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq('id', trial.id);
        
        results.push({
          storeId: trial.store_id,
          success: !updateError,
          error: updateError ? updateError.message : 'Trial expired',
        });
      }
    }

    const summary = {
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      timestamp: now.toISOString(),
    };

    console.log('Renewal check complete:', summary);

    return new Response(
      JSON.stringify({ summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Subscription renewal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});