
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function createCorsResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}

export function createOptionsResponse(): Response {
  return new Response(null, { headers: corsHeaders })
}

export function createErrorResponse(message: string, status: number = 500, extraData?: any): Response {
  const errorData = { error: message, ...extraData }
  return createCorsResponse(errorData, status)
}

export function createSuccessResponse(data: any): Response {
  return createCorsResponse(data)
}

export function createRateLimitResponse(message: string, retryAfter?: string): Response {
  const data = retryAfter ? { error: message, retryAfter } : { error: message }
  return createCorsResponse(data, 429)
}

export function createSuspiciousActivityResponse(): Response {
  return createCorsResponse({
    error: 'Transaction bloquée pour des raisons de sécurité. Veuillez contacter le support.',
    securityCode: 'BLOCKED_SUSPICIOUS'
  }, 403)
}

export function createStandardAdResponse(adId: string): Response {
  return createSuccessResponse({
    success: true,
    adId,
    paymentRequired: false
  })
}

export function createPremiumAdResponse(
  paymentUrl: string,
  transactionId: string,
  expiresAt: string,
  securityScore: number
): Response {
  return createSuccessResponse({
    success: true,
    paymentRequired: true,
    paymentUrl,
    transactionId,
    expiresAt,
    securityScore
  })
}
