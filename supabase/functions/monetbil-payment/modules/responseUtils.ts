
import { corsHeaders } from '../index.ts'

export function createOptionsResponse(): Response {
  return new Response(null, { 
    headers: corsHeaders 
  })
}

export function createErrorResponse(message: string, status: number = 500): Response {
  console.error('Creating error response:', message)
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      timestamp: new Date().toISOString()
    }), 
    { 
      status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}

export function createRateLimitResponse(message: string, retryAfter?: number): Response {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  }
  
  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }
  
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: retryAfter || 60,
      timestamp: new Date().toISOString()
    }), 
    { 
      status: 429,
      headers 
    }
  )
}

export function createSuspiciousActivityResponse(): Response {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'Activité suspecte détectée. Veuillez réessayer plus tard.',
      code: 'SUSPICIOUS_ACTIVITY',
      timestamp: new Date().toISOString()
    }), 
    { 
      status: 403,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}

export function createStandardAdResponse(adId: string): Response {
  return new Response(
    JSON.stringify({ 
      success: true, 
      paymentRequired: false,
      adId: adId,
      message: 'Annonce gratuite créée avec succès',
      timestamp: new Date().toISOString()
    }), 
    { 
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}

export function createPremiumAdResponse(
  paymentUrl: string, 
  transactionId: string, 
  expiresAt: string, 
  securityScore: number
): Response {
  console.log('Creating premium ad response with payment URL:', paymentUrl.substring(0, 50) + '...')
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      paymentRequired: true,
      paymentUrl: paymentUrl,
      transactionId: transactionId,
      expiresAt: expiresAt,
      securityScore: securityScore,
      message: 'Redirection vers le paiement Monetbil',
      timestamp: new Date().toISOString()
    }), 
    { 
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}
