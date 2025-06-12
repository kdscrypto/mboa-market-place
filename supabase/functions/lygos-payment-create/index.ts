
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
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  return_url: string;
  cancel_url: string;
  webhook_url: string;
  external_reference: string;
}

interface LygosPaymentResponse {
  success: boolean;
  payment_id?: string;
  checkout_url?: string;
  error?: string;
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

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token d\'authentification manquant')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication error:', authError)
      throw new Error('Token d\'authentification invalide')
    }

    const { transactionId } = await req.json()
    console.log('Creating Lygos payment for transaction:', transactionId)

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction not found:', transactionError)
      throw new Error('Transaction non trouvée')
    }

    // Get Lygos API key
    const lygosApiKey = Deno.env.get('LYGOS_API_KEY')
    if (!lygosApiKey) {
      console.error('Lygos API key not configured')
      throw new Error('Configuration Lygos manquante')
    }

    // Prepare Lygos payment request according to official docs
    const lygosRequest = {
      amount: transaction.amount,
      currency: transaction.currency || 'XAF',
      description: `Annonce premium - Mboa Market`,
      customer_name: transaction.payment_data?.customer_name || user.email || '',
      customer_email: transaction.payment_data?.customer_email || user.email || '',
      customer_phone: transaction.payment_data?.customer_phone || '',
      return_url: `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/payment-return?transaction=${transactionId}`,
      cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/payment-cancel?transaction=${transactionId}`,
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/lygos-webhook`,
      external_reference: transaction.external_reference
    }

    console.log('Sending request to Lygos API:', lygosRequest)

    // Call Lygos API using correct endpoint and authentication
    const lygosResponse = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': lygosApiKey, // Correct authentication header
        'Accept': 'application/json'
      },
      body: JSON.stringify(lygosRequest)
    })

    if (!lygosResponse.ok) {
      const errorText = await lygosResponse.text()
      console.error('Lygos API error:', lygosResponse.status, errorText)
      throw new Error(`Erreur Lygos: ${lygosResponse.status} - ${errorText}`)
    }

    const lygosData = await lygosResponse.json()
    console.log('Lygos response:', lygosData)

    // Extract payment details from response
    const paymentId = lygosData.payment_id || lygosData.id
    const checkoutUrl = lygosData.link || lygosData.checkout_url || lygosData.payment_url

    if (!checkoutUrl) {
      console.error('No checkout URL in Lygos response:', lygosData)
      throw new Error('URL de paiement manquante dans la réponse Lygos')
    }

    // Update transaction with Lygos payment details
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        lygos_payment_id: paymentId,
        payment_data: {
          ...transaction.payment_data,
          lygos_response: lygosData,
          checkout_url: checkoutUrl
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      throw new Error('Erreur lors de la mise à jour de la transaction')
    }

    // Log audit trail
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'lygos_payment_created',
        event_data: {
          lygos_payment_id: paymentId,
          checkout_url: checkoutUrl,
          api_endpoint: 'https://api.lygosapp.com/v1/gateway',
          timestamp: new Date().toISOString()
        }
      })

    const response: LygosPaymentResponse = {
      success: true,
      payment_id: paymentId,
      checkout_url: checkoutUrl
    }

    console.log('Lygos payment created successfully:', response)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error creating Lygos payment:', error)
    
    const errorResponse: LygosPaymentResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
