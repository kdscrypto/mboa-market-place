
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

    // Get Lygos configuration
    const lygosApiKey = Deno.env.get('LYGOS_API_KEY')
    if (!lygosApiKey) {
      console.error('Lygos API key not configured')
      throw new Error('Configuration Lygos manquante')
    }

    // Prepare Lygos payment request
    const lygosRequest: LygosPaymentRequest = {
      amount: transaction.amount,
      currency: transaction.currency,
      description: `Annonce premium - Mboa Market`,
      customer_name: transaction.payment_data?.customer_name || user.email || '',
      customer_email: transaction.payment_data?.customer_email || user.email || '',
      customer_phone: transaction.payment_data?.customer_phone || ''
    }

    console.log('Sending request to Lygos:', lygosRequest)

    // Call Lygos API to create payment
    const lygosResponse = await fetch('https://api.lygosapp.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lygosApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...lygosRequest,
        return_url: `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/payment-return?transaction=${transactionId}`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/payment-cancel?transaction=${transactionId}`,
        external_reference: transaction.external_reference
      })
    })

    if (!lygosResponse.ok) {
      const errorText = await lygosResponse.text()
      console.error('Lygos API error:', lygosResponse.status, errorText)
      throw new Error(`Erreur Lygos: ${lygosResponse.status} - ${errorText}`)
    }

    const lygosData = await lygosResponse.json()
    console.log('Lygos response:', lygosData)

    // Update transaction with Lygos payment ID and checkout URL
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        lygos_payment_id: lygosData.payment_id || lygosData.id,
        payment_data: {
          ...transaction.payment_data,
          lygos_response: lygosData,
          checkout_url: lygosData.checkout_url || lygosData.payment_url
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
          lygos_payment_id: lygosData.payment_id || lygosData.id,
          checkout_url: lygosData.checkout_url || lygosData.payment_url,
          timestamp: new Date().toISOString()
        }
      })

    const response: LygosPaymentResponse = {
      success: true,
      payment_id: lygosData.payment_id || lygosData.id,
      checkout_url: lygosData.checkout_url || lygosData.payment_url
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
