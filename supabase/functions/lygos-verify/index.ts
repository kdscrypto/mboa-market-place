
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
    const lygosApiKey = Deno.env.get('LYGOS_API_KEY');

    if (!lygosApiKey) {
      throw new Error('LYGOS_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { paymentId } = await req.json();

    console.log('Verifying Lygos payment:', paymentId);

    // Call Lygos API to verify payment status
    const lygosResponse = await fetch(`https://api.lygos.cm/api/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${lygosApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!lygosResponse.ok) {
      const errorText = await lygosResponse.text();
      console.error('Lygos verification API error:', errorText);
      throw new Error(`Lygos verification failed: ${errorText}`);
    }

    const lygosResult = await lygosResponse.json();
    console.log('Lygos payment verification result:', lygosResult);

    return new Response(JSON.stringify({
      success: true,
      status: lygosResult.status,
      paymentData: lygosResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in lygos-verify function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
