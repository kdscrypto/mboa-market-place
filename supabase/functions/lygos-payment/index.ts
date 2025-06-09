
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LygosPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  externalReference: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lygosApiKey = Deno.env.get('LYGOS_API_KEY');

    if (!lygosApiKey) {
      throw new Error('LYGOS_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const paymentData: LygosPaymentRequest = await req.json();

    console.log('Processing Lygos payment request:', paymentData);

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: paymentData.externalReference.split('_')[1], // Extract user ID from reference
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        payment_method: 'lygos',
        payment_data: {
          description: paymentData.description,
          customerInfo: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            phone: paymentData.customerPhone
          }
        },
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        notify_url: paymentData.webhookUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw new Error('Failed to create payment transaction');
    }

    // Call Lygos API to create payment
    const lygosResponse = await fetch('https://api.lygos.cm/api/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lygosApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        customer: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          phone: paymentData.customerPhone
        },
        return_url: paymentData.returnUrl,
        cancel_url: paymentData.cancelUrl,
        webhook_url: paymentData.webhookUrl,
        external_reference: transaction.id
      })
    });

    if (!lygosResponse.ok) {
      const errorText = await lygosResponse.text();
      console.error('Lygos API error:', errorText);
      
      // Update transaction status to failed
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      throw new Error(`Lygos API error: ${errorText}`);
    }

    const lygosResult = await lygosResponse.json();
    console.log('Lygos payment created:', lygosResult);

    // Update transaction with Lygos payment details
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        payment_url: lygosResult.payment_url,
        payment_data: {
          ...transaction.payment_data,
          lygosPaymentId: lygosResult.payment_id,
          lygosStatus: lygosResult.status
        }
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // Log the payment attempt
    await supabase
      .from('lygos_payment_attempts')
      .insert({
        transaction_id: transaction.id,
        lygos_payment_id: lygosResult.payment_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'initiated',
        lygos_response: lygosResult
      });

    return new Response(JSON.stringify({
      success: true,
      paymentId: lygosResult.payment_id,
      paymentUrl: lygosResult.payment_url,
      transactionId: transaction.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in lygos-payment function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
