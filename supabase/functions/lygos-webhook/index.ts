
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== Lygos Webhook Received ===');
    
    const payload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Extract payment information from Lygos webhook
    const paymentId = payload.payment_id || payload.id;
    const status = payload.status?.toLowerCase();
    const amount = payload.amount;
    const currency = payload.currency;
    
    if (!paymentId) {
      console.error('No payment ID in webhook payload');
      throw new Error('Payment ID manquant dans le webhook');
    }

    console.log('Processing payment:', { paymentId, status, amount, currency });

    // Find the transaction by Lygos payment ID
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('lygos_payment_id', paymentId)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found for payment ID:', paymentId, transactionError);
      
      // Log the webhook for debugging but don't fail
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: null,
          event_type: 'lygos_webhook_orphaned',
          event_data: {
            lygos_payment_id: paymentId,
            payload: payload,
            error: 'Transaction not found',
            timestamp: new Date().toISOString()
          }
        });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Transaction not found',
          payment_id: paymentId 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Found transaction:', transaction.id);

    // Determine new transaction status based on Lygos status
    let newStatus = transaction.status;
    let completedAt = null;

    switch (status) {
      case 'completed':
      case 'success':
      case 'paid':
        newStatus = 'completed';
        completedAt = new Date().toISOString();
        break;
      case 'failed':
      case 'cancelled':
      case 'canceled':
        newStatus = 'failed';
        break;
      case 'expired':
        newStatus = 'expired';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      default:
        console.warn('Unknown Lygos status:', status);
        newStatus = 'pending';
    }

    // Update the transaction
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: newStatus,
        lygos_status: status,
        completed_at: completedAt,
        callback_data: {
          ...transaction.callback_data,
          lygos_webhook: payload,
          webhook_received_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw new Error('Erreur lors de la mise à jour de la transaction');
    }

    // If payment is completed, update the ad status
    if (newStatus === 'completed' && transaction.ad_id) {
      console.log('Payment completed, updating ad status for:', transaction.ad_id);
      
      const { error: adUpdateError } = await supabase
        .from('ads')
        .update({
          status: 'pending', // Set to pending for moderation
          ad_type: 'premium_24h', // Default premium type
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.ad_id);

      if (adUpdateError) {
        console.error('Error updating ad status:', adUpdateError);
        // Don't fail the webhook for this, just log it
      } else {
        console.log('Ad status updated successfully');
      }
    }

    // Log the webhook processing
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'lygos_webhook_processed',
        event_data: {
          lygos_payment_id: paymentId,
          old_status: transaction.status,
          new_status: newStatus,
          lygos_status: status,
          payload: payload,
          timestamp: new Date().toISOString()
        }
      });

    console.log('Webhook processed successfully for transaction:', transaction.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        transaction_id: transaction.id,
        status: newStatus
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== Lygos Webhook Error ===');
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
