
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get request body
    const { paymentId } = await req.json();
    console.log('Verifying Lygos payment:', paymentId);

    if (!paymentId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment ID manquant' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Call Lygos verification API
    const lygosApiUrl = `${config.base_url}/api/v1/payments/${paymentId}`;
    console.log('Verifying payment at:', lygosApiUrl);

    const lygosResponse = await fetch(lygosApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.api_key}`,
        'Accept': 'application/json'
      }
    });

    const lygosResult = await lygosResponse.json();
    console.log('Lygos verification response:', lygosResult);

    if (!lygosResponse.ok) {
      console.error('Lygos verification error:', lygosResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: lygosResult.message || 'Erreur lors de la vérification du paiement' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return verification result
    return new Response(
      JSON.stringify({
        success: true,
        paymentData: lygosResult,
        status: lygosResult.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Lygos verification function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
