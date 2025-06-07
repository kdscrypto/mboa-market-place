
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCorsPreflightRequest } from "./modules/corsConfig.ts"
import { handleWebhookRequest } from "./modules/webhookHandler.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    return await handleWebhookRequest(req);
  } catch (error) {
    console.error('Critical webhook processing error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
