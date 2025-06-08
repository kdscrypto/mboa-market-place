
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
  callMonetbilAPI,
  type PaymentRequest
} from './modules/paymentProcessing.ts'

import {
  createPaymentTransaction,
  updateTransactionWithMonetbilResponse,
  generatePaymentUrls,
  type TransactionData
} from './modules/transactionManagement.ts'

import {
  logTransactionCreated,
  logMonetbilApiError,
  logPaymentInitiated
} from './modules/auditLogging.ts'

import {
  createOptionsResponse,
  createErrorResponse,
  createRateLimitResponse,
  createSuspiciousActivityResponse,
  createStandardAdResponse,
  createPremiumAdResponse
} from './modules/responseUtils.ts'

serve(async (req) => {
  console.log('=== PAYMENT FUNCTION START ===')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

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
    
    // Check user-based rate limiting (simplified to avoid constraint issues)
    const userRateLimit = await checkRateLimit(supabase, user.id, 'user', 10, 60)
    if (!userRateLimit.allowed) {
      console.log('User rate limit exceeded:', userRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de paiement. Veuillez réessayer plus tard.',
        userRateLimit.retryAfter
      )
    }

    // Check IP-based rate limiting (simplified to avoid constraint issues)
    const ipRateLimit = await checkRateLimit(supabase, clientIP, 'ip', 15, 60)
    if (!ipRateLimit.allowed) {
      console.log('IP rate limit exceeded:', ipRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de paiement depuis cette adresse IP. Veuillez réessayer plus tard.',
        ipRateLimit.retryAfter
      )
    }

    console.log('Parsing request body...')
    const { adData, adType }: PaymentRequest = await req.json()
    console.log('Payment request received:', { 
      userId: user.id, 
      adType, 
      adTitle: adData.title,
      adPrice: adData.price,
      clientIP 
    })

    // Validate payment amount
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

    // For standard ads (free), process directly
    if (amount === 0) {
      console.log('Processing standard (free) ad...')
      const adId = await processStandardAd(supabase, adData, adType, user.id)
      console.log('Standard ad created successfully:', adId)
      return createStandardAdResponse(adId)
    }

    // For premium ads, create payment transaction with enhanced security features
    console.log('Processing premium ad payment...')
    const { returnUrl, cancelUrl, notifyUrl } = generatePaymentUrls(req)
    console.log('Payment URLs generated:', { returnUrl, cancelUrl, notifyUrl })

    // Generate client fingerprint for additional security
    const clientFingerprint = await generateClientFingerprint(userAgent, clientIP)
    console.log('Client fingerprint generated:', clientFingerprint)

    // Calculate security score based on various factors
    const securityScore = calculateSecurityScore(suspiciousActivity, userRateLimit, ipRateLimit)
    console.log('Security score calculated:', securityScore)

    // Create payment transaction record with enhanced security
    const transactionData: TransactionData = {
      user_id: user.id,
      amount,
      currency: 'XAF',
      status: 'pending',
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      payment_data: { 
        adData, 
        adType,
        client_ip: clientIP,
        user_agent: userAgent,
        security_fingerprint: clientFingerprint
      },
      client_fingerprint: clientFingerprint,
      security_score: securityScore,
    }

    console.log('Creating payment transaction...')
    const transaction = await createPaymentTransaction(supabase, transactionData)
    console.log('Payment transaction created:', { id: transaction.id, expires_at: transaction.expires_at })

    // Enhanced audit logging with security context
    await logTransactionCreated(
      supabase,
      transaction.id,
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

    // Get Monetbil API credentials
    console.log('Retrieving Monetbil credentials...')
    const serviceKey = Deno.env.get('MONETBIL_SERVICE_KEY')
    const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')

    console.log('Monetbil credentials check:', {
      hasServiceKey: !!serviceKey,
      serviceKeyLength: serviceKey?.length || 0,
      hasServiceSecret: !!serviceSecret,
      serviceSecretLength: serviceSecret?.length || 0
    })

    if (!serviceKey || !serviceSecret) {
      console.error('Monetbil API credentials not configured')
      return createErrorResponse('Service de paiement non configuré. Veuillez contacter l\'administrateur.')
    }

    try {
      console.log('Calling Monetbil API...')
      // Call Monetbil API
      const monetbilResult = await callMonetbilAPI(
        serviceKey,
        serviceSecret,
        amount,
        adData,
        transaction.id,
        user.id,
        user.email,
        returnUrl,
        cancelUrl,
        notifyUrl
      )

      console.log('Monetbil API call successful, token received:', monetbilResult.substring(0, 20) + '...')

      // Update transaction with Monetbil response
      await updateTransactionWithMonetbilResponse(supabase, transaction.id, monetbilResult)

      // Enhanced success logging
      await logPaymentInitiated(
        supabase,
        transaction.id,
        monetbilResult,
        securityScore,
        clientFingerprint,
        suspiciousActivity,
        clientIP,
        userAgent
      )

      const paymentUrl = `https://api.monetbil.com/widget/v2.1/${monetbilResult}`
      console.log('Payment URL generated:', paymentUrl)
      
      console.log('=== PAYMENT FUNCTION SUCCESS ===')
      return createPremiumAdResponse(
        paymentUrl,
        transaction.id,
        transaction.expires_at,
        securityScore
      )

    } catch (monetbilError) {
      console.error('=== MONETBIL API ERROR ===')
      console.error('Monetbil API error details:', {
        error: monetbilError,
        message: monetbilError.message,
        stack: monetbilError.stack
      })
      
      // Enhanced API error logging
      await logMonetbilApiError(
        supabase,
        transaction.id,
        500,
        monetbilError.message,
        clientIP,
        userAgent,
        securityScore
      )
      
      return createErrorResponse(
        `Erreur de paiement: ${monetbilError.message}`,
        500
      )
    }

  } catch (error) {
    console.error('=== PAYMENT PROCESSING ERROR ===')
    console.error('Payment processing error details:', {
      error: error,
      message: error.message,
      stack: error.stack
    })
    return createErrorResponse(
      error.message || 'Erreur lors du traitement du paiement',
      500
    )
  }
})
