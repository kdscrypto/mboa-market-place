
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Monetbil webhook called but no longer needed - all ads are free');

  // Return a message that the webhook is no longer needed
  return new Response(
    JSON.stringify({
      message: "Monetbil integration has been completely removed - all ads are now free",
      status: "deprecated",
      timestamp: new Date().toISOString(),
      migration_completed: true
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
})
