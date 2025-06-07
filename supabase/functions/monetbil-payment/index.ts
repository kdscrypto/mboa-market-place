
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createOptionsResponse()
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract security information
    const { clientIP, userAgent } = await extractSecurityInfo(req)

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    const user = await verifyUserAuthentication(supabase, authHeader)

    console.log('Checking rate limits for user and IP...')
    
    // Check user-based rate limiting
    const userRateLimit = await checkRateLimit(supabase, user.id, 'user', 5, 60)
    if (!userRateLimit.allowed) {
      console.log('User rate limit exceeded:', userRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de paiement. Veuillez réessayer plus tard.',
        userRateLimit.retryAfter
      )
    }

    // Check IP-based rate limiting
    const ipRateLimit = await checkRateLimit(supabase, clientIP, 'ip', 10, 60)
    if (!ipRateLimit.allowed) {
      console.log('IP rate limit exceeded:', ipRateLimit)
      return createRateLimitResponse(
        'Trop de tentatives de paiement depuis cette adresse IP. Veuillez réessayer plus tard.',
        ipRateLimit.retryAfter
      )
    }

    const { adData, adType }: PaymentRequest = await req.json()
    console.log('Payment request received:', { userId: user.id, adType, adData: adData.title, clientIP })

    // Validate payment amount
    const amount = validatePaymentAmount(adType)

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
      const adId = await processStandardAd(supabase, adData, adType, user.id)
      return createStandardAdResponse(adId)
    }

    // For premium ads, create payment transaction with enhanced security features
    const { returnUrl, cancelUrl, notifyUrl } = generatePaymentUrls(req)

    // Generate client fingerprint for additional security
    const clientFingerprint = await generateClientFingerprint(userAgent, clientIP)

    // Calculate security score based on various factors
    const securityScore = calculateSecurityScore(suspiciousActivity, userRateLimit, ipRateLimit)

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

    const transaction = await createPaymentTransaction(supabase, transactionData)

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
    const serviceKey = Deno.env.get('MONETBIL_SERVICE_KEY')
    const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')

    if (!serviceKey || !serviceSecret) {
      console.error('Monetbil API credentials not configured')
      throw new Error('Payment service not properly configured')
    }

    try {
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

      return createPremiumAdResponse(
        `https://api.monetbil.com/widget/v2.1/${monetbilResult}`,
        transaction.id,
        transaction.expires_at,
        securityScore
      )

    } catch (monetbilError) {
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
      
      throw monetbilError
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return createErrorResponse(error.message || 'Payment processing failed')
  }
})
