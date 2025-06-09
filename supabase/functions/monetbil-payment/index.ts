
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Import our modules
import {
  extractSecurityInfo,
  verifyUserAuthentication,
  checkRateLimit,
  detectSuspiciousActivity,
  calculateSecurityScore,
  generateClientFingerprint,
  type SecurityContext,
  type RateLimitResult,
  type SuspiciousActivityResult
} from './modules/securityValidation.ts'

import {
  validatePaymentAmount,
  processStandardAd,
  type PaymentRequest
} from './modules/paymentProcessing.ts'

import {
  logTransactionCreated
} from './modules/auditLogging.ts'

import {
  createOptionsResponse,
  createErrorResponse,
  createRateLimitResponse,
  createSuspiciousActivityResponse,
  createStandardAdResponse
} from './modules/responseUtils.ts'

serve(async (req) => {
  console.log('=== FREE AD CREATION FUNCTION START ===')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return createOptionsResponse()
  }

  try {
    console.log('Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract security information
    console.log('Extracting security information...')
    const { clientIP, userAgent } = await extractSecurityInfo(req)

    // Verify user authentication
    console.log('Verifying user authentication...')
    const authHeader = req.headers.get('Authorization')
    const user = await verifyUserAuthentication(supabase, authHeader)
    console.log('User authenticated successfully:', { userId: user.id, email: user.email })

    console.log('Checking rate limits for user and IP...')
    
    // Check user-based rate limiting using database function
    const userRateLimit = await checkRateLimit(supabase, user.id, 'user', 10, 60) // Increased limit for free ads
    if (!userRateLimit.allowed) {
      console.log('User rate limit exceeded:', userRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de création d\'annonces. Veuillez réessayer plus tard.',
        userRateLimit.retryAfter
      )
    }

    // Check IP-based rate limiting using database function
    const ipRateLimit = await checkRateLimit(supabase, clientIP, 'ip', 20, 60) // Increased limit for free ads
    if (!ipRateLimit.allowed) {
      console.log('IP rate limit exceeded:', ipRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de création d\'annonces depuis cette adresse IP. Veuillez réessayer plus tard.',
        ipRateLimit.retryAfter
      )
    }

    console.log('Parsing request body...')
    const { adData, adType }: PaymentRequest = await req.json()
    console.log('Ad creation request received:', { 
      userId: user.id, 
      adType, 
      adTitle: adData.title,
      adPrice: adData.price,
      clientIP 
    })

    // Validate payment amount (should always be 0 now)
    console.log('Validating payment amount...')
    const amount = validatePaymentAmount(adType)
    console.log('Amount validated:', amount)

    // Enhanced suspicious activity detection
    const suspiciousActivityData = {
      user_id: user.id,
      amount,
      ad_type: adType,
      client_ip: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    }

    const suspiciousActivity = await detectSuspiciousActivity(supabase, user.id, 'user', suspiciousActivityData)

    if (suspiciousActivity.auto_block) {
      console.log('Suspicious activity detected, blocking transaction:', suspiciousActivity)
      return createSuspiciousActivityResponse()
    }

    // All ads are now free - process directly
    console.log('Processing free ad (all ads are now free)...')
    const adId = await processStandardAd(supabase, adData, adType, user.id)
    console.log('Free ad created successfully:', adId)
    
    // Generate client fingerprint for security logging
    const clientFingerprint = await generateClientFingerprint(userAgent, clientIP)
    console.log('Client fingerprint generated:', clientFingerprint)

    // Calculate security score based on various factors
    const securityScore = calculateSecurityScore(suspiciousActivity, userRateLimit, ipRateLimit)
    console.log('Security score calculated:', securityScore)

    // Enhanced audit logging with security context (using a fake transaction ID for logging)
    const fakeTransactionId = `free-ad-${adId}`
    await logTransactionCreated(
      supabase,
      fakeTransactionId,
      user.id,
      amount,
      adType,
      clientIP,
      userAgent,
      securityScore,
      userRateLimit,
      ipRateLimit,
      suspiciousActivity,
      clientFingerprint
    )
    
    console.log('=== FREE AD CREATION SUCCESS ===')
    return createStandardAdResponse(adId)

  } catch (error) {
    console.error('=== AD CREATION ERROR ===')
    console.error('Ad creation error details:', {
      error: error,
      message: error.message,
      stack: error.stack
    })
    return createErrorResponse(
      error.message || 'Erreur lors de la création de l\'annonce',
      500
    )
  }
})
