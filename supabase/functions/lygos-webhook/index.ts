
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log('Received Lygos webhook:', webhookData);

    // Log the webhook
    await supabase
      .from('lygos_webhook_logs')
      .insert({
        webhook_data: webhookData,
        processed: false,
        received_at: new Date().toISOString()
      });

    const { 
      payment_id: lygosPaymentId, 
      status, 
      external_reference: transactionId,
      amount,
      currency
    } = webhookData;

    if (!transactionId) {
      console.error('No external reference (transaction ID) in webhook data');
      return new Response('Missing transaction reference', { status: 400 });
    }

    // Find the transaction
    const { data: transaction, error: findError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (findError || !transaction) {
      console.error('Transaction not found:', transactionId);
      return new Response('Transaction not found', { status: 404 });
    }

    // Update transaction status based on Lygos status
    let newStatus = 'pending';
    let completedAt = null;

    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        newStatus = 'completed';
        completedAt = new Date().toISOString();
        break;
      case 'failed':
      case 'error':
      case 'cancelled':
        newStatus = 'failed';
        break;
      case 'expired':
        newStatus = 'expired';
        break;
      default:
        newStatus = 'pending';
    }

    // Update the transaction
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: newStatus,
        completed_at: completedAt,
        payment_data: {
          ...transaction.payment_data,
          lygosWebhookData: webhookData,
          lygosStatus: status
        }
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response('Error updating transaction', { status: 500 });
    }

    // Update payment attempt
    await supabase
      .from('lygos_payment_attempts')
      .update({
        status: newStatus,
        completed_at: completedAt,
        lygos_response: webhookData
      })
      .eq('lygos_payment_id', lygosPaymentId);

    // If payment was successful, create/update the ad
    if (newStatus === 'completed' && transaction.ad_id) {
      const adType = transaction.payment_data?.adType || 'premium_24h';
      
      const { error: adError } = await supabase
        .from('ads')
        .update({
          status: 'active',
          ad_type: adType,
          payment_transaction_id: transactionId,
          premium_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default 24h
        })
        .eq('id', transaction.ad_id);

      if (adError) {
        console.error('Error updating ad:', adError);
      }
    }

    // Mark webhook as processed
    await supabase
      .from('lygos_webhook_logs')
      .update({ processed: true })
      .eq('webhook_data->payment_id', lygosPaymentId);

    console.log(`Payment ${lygosPaymentId} updated to status: ${newStatus}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in lygos-webhook function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
