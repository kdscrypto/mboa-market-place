
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
      error: message 
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
      code: 'RATE_LIMIT_EXCEEDED'
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
      code: 'SUSPICIOUS_ACTIVITY'
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
      message: 'Annonce gratuite créée avec succès'
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
  // Validation de l'URL de paiement
  if (!paymentUrl || paymentUrl.includes('%3Ch1%3E') || paymentUrl.includes('<h1>')) {
    console.error('Invalid payment URL detected:', paymentUrl)
    return createErrorResponse(
      'Erreur lors de la génération du lien de paiement. Veuillez vérifier votre configuration Monetbil.',
      500
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      paymentRequired: true,
      paymentUrl: paymentUrl,
      transactionId: transactionId,
      expiresAt: expiresAt,
      securityScore: securityScore,
      message: 'Redirection vers le paiement Monetbil'
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
