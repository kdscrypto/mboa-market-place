
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get webhook payload
    const webhookData = await req.json();
    console.log('Received Lygos webhook:', webhookData);

    // Extract payment information
    const paymentId = webhookData.payment_id || webhookData.id;
    const status = webhookData.status;
    const externalReference = webhookData.reference || webhookData.external_reference;

    if (!paymentId || !status) {
      console.error('Invalid webhook data:', webhookData);
      return new Response(
        JSON.stringify({ error: 'Données webhook invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status using the database function
    const { data: updateResult, error: updateError } = await supabaseClient
      .rpc('update_lygos_transaction_status', {
        p_lygos_payment_id: paymentId,
        p_status: status,
        p_lygos_data: webhookData,
        p_completed_at: status === 'completed' || status === 'success' ? new Date().toISOString() : null
      });

    if (updateError) {
      console.error('Error updating transaction status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la mise à jour de la transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment is completed, update related ad status
    if ((status === 'completed' || status === 'success') && externalReference) {
      // Extract ad ID from external reference if it follows our pattern
      const adIdMatch = externalReference.match(/ad_[^_]+_(.+)/);
      if (adIdMatch) {
        const adId = adIdMatch[1];
        
        // Update ad status to active
        const { error: adUpdateError } = await supabaseClient
          .from('ads')
          .update({ 
            status: 'active',
            premium_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', adId);

        if (adUpdateError) {
          console.error('Error updating ad status:', adUpdateError);
        } else {
          console.log('Ad activated successfully:', adId);
        }
      }
    }

    // Log webhook processing
    const { error: logError } = await supabaseClient
      .from('payment_audit_logs')
      .insert({
        transaction_id: 'webhook-processing',
        event_type: 'lygos_webhook_received',
        event_data: {
          payment_id: paymentId,
          status: status,
          external_reference: externalReference,
          webhook_data: webhookData,
          processed_at: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    console.log('Webhook processed successfully');
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook traité avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Lygos webhook function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
