
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting security cleanup...');

    // Execute advanced security cleanup
    const { data: cleanupResults, error: cleanupError } = await supabase
      .rpc('advanced_security_cleanup');

    if (cleanupError) {
      console.error('Security cleanup failed:', cleanupError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: cleanupError.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Security cleanup completed:', cleanupResults);

    // Get security metrics after cleanup
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('security_performance_metrics', { p_time_window_hours: 24 });

    const response = {
      success: true,
      cleanup_results: cleanupResults,
      security_metrics: metricsError ? null : metricsData,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Security cleanup exception:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during cleanup' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
