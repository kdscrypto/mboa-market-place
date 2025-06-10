
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

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
  transactionId?: string;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get request body
    const paymentData: LygosPaymentRequest = await req.json();
    console.log('Creating Lygos payment:', paymentData);

    // Get Lygos configuration
    const { data: config, error: configError } = await supabaseClient
      .rpc('get_active_lygos_config');

    if (configError || !config || !config.api_key) {
      console.error('Lygos configuration error:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuration Lygos manquante ou invalide' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Lygos API request
    const lygosApiUrl = `${config.base_url}/api/v1/payments`;
    const lygosPayload = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      customer: {
        name: paymentData.customerName,
        email: paymentData.customerEmail,
        phone: paymentData.customerPhone
      },
      urls: {
        return: paymentData.returnUrl,
        cancel: paymentData.cancelUrl,
        webhook: paymentData.webhookUrl
      },
      reference: paymentData.externalReference
    };

    console.log('Sending request to Lygos API:', lygosApiUrl);

    // Call Lygos API
    const lygosResponse = await fetch(lygosApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(lygosPayload)
    });

    const lygosResult = await lygosResponse.json();
    console.log('Lygos API response:', lygosResult);

    if (!lygosResponse.ok) {
      console.error('Lygos API error:', lygosResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: lygosResult.message || 'Erreur lors de la création du paiement Lygos' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: lygosResult.payment_id || lygosResult.id,
        paymentUrl: lygosResult.payment_url || lygosResult.checkout_url,
        transactionId: paymentData.transactionId,
        status: lygosResult.status,
        paymentData: lygosResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Lygos payment function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
