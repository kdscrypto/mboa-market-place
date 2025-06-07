
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  parseWebhookFormData, 
  validateWebhookSignature, 
  validateRequiredFields,
  validateWebhookSecurity
} from "./webhookValidation.ts"
import { 
  checkWebhookRateLimit, 
  detectSuspiciousWebhookActivity, 
  logSecurityViolation,
  validateWebhookOrigin
} from "./webhookSecurity.ts"
import { 
  acquireTransactionLock, 
  releaseTransactionLock 
} from "./transactionLocking.ts"
import { 
  validateTransactionExists, 
  processSuccessfulPayment, 
  updateTransactionStatus, 
  createTransactionUpdateData,
  validateTransactionSecurity
} from "./paymentProcessing.ts"
import { 
  logWebhookProcessingStart, 
  logTransactionExpired, 
  logAdCreationResult, 
  logPaymentFailure, 
  logWebhookProcessingComplete 
} from "./webhookAuditLogging.ts"

export async function handleWebhookRequest(req: Request): Promise<Response> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Get Monetbil credentials for webhook verification
  const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')
  
  if (!serviceSecret) {
    console.error('Monetbil service secret not configured')
    return new Response('Service configuration error', { status: 500 })
  }

  // Extract security information for enhanced audit logging
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  // Validate webhook origin first
  const { valid: originValid, reason: originReason } = await validateWebhookOrigin(
    supabase, 
    clientIP, 
    userAgent
  )
  
  if (!originValid) {
    console.error('Invalid webhook origin:', originReason)
    await logSecurityViolation(
      supabase,
      'unknown',
      'invalid_origin',
      { reason: originReason },
      { clientIP, userAgent, rateLimitInfo: null, suspiciousActivity: null }
    )
    return new Response('Forbidden', { status: 403 })
  }

  // Enhanced rate limiting for webhook calls - FAIL SECURE
  const { allowed: rateLimitAllowed, rateLimitInfo } = await checkWebhookRateLimit(supabase, clientIP)
  
  if (!rateLimitAllowed) {
    console.error('Webhook rate limit exceeded for IP:', clientIP)
    return new Response('Rate limit exceeded', { status: 429 })
  }

  // Parse webhook form data
  const formData = await req.formData()
  const webhookData = await parseWebhookFormData(req)

  console.log('Secure webhook received:', { 
    status: webhookData.status, 
    transactionId: webhookData.transactionId, 
    monetbilTransactionId: webhookData.monetbilTransactionId,
    hasSignature: !!webhookData.signature,
    clientIP,
    timestamp: new Date().toISOString()
  })

  // CRITICAL: Validate required fields with enhanced security
  const validationError = validateRequiredFields(webhookData)
  if (validationError) {
    console.error('Webhook validation failed:', validationError)
    return new Response(validationError, { status: 400 })
  }

  // CRITICAL: Validate webhook security (signature is now mandatory)
  const securityError = validateWebhookSecurity(webhookData, !!webhookData.signature)
  if (securityError) {
    console.error('Webhook security validation failed:', securityError)
    await logSecurityViolation(
      supabase,
      webhookData.transactionId!,
      'security_validation_failed',
      { error: securityError },
      { clientIP, userAgent, rateLimitInfo, suspiciousActivity: null }
    )
    return new Response('Security validation failed', { status: 403 })
  }

  // Enhanced suspicious activity detection for webhooks
  const securityContext = {
    clientIP,
    userAgent,
    rateLimitInfo,
    suspiciousActivity: null
  }

  const { shouldBlock, activityData } = await detectSuspiciousWebhookActivity(
    supabase, 
    webhookData, 
    securityContext
  )

  if (shouldBlock) {
    console.error('Webhook blocked due to suspicious activity')
    await logSecurityViolation(
      supabase,
      webhookData.transactionId!,
      'suspicious_activity_blocked',
      { activityData },
      { ...securityContext, suspiciousActivity: activityData }
    )
    return new Response('Request blocked due to suspicious activity', { status: 403 })
  }

  securityContext.suspiciousActivity = activityData

  // CRITICAL: Webhook signature verification is now MANDATORY
  if (!webhookData.signature) {
    console.error('Missing required webhook signature')
    await logSecurityViolation(
      supabase,
      webhookData.transactionId!,
      'missing_signature',
      { timestamp: new Date().toISOString() },
      securityContext
    )
    return new Response('Webhook signature required', { status: 401 })
  }

  const isValidSignature = await validateWebhookSignature(
    formData, 
    webhookData.signature, 
    serviceSecret
  )
  
  if (!isValidSignature) {
    console.error('Invalid webhook signature detected')
    
    await logSecurityViolation(
      supabase,
      webhookData.transactionId!,
      'invalid_signature',
      {
        provided_signature_length: webhookData.signature.length,
        timestamp: new Date().toISOString()
      },
      securityContext
    )
    
    return new Response('Invalid webhook signature', { status: 401 })
  }
  console.log('Webhook signature verified successfully')

  // Acquire processing lock
  const { acquired: lockAcquired, lockIdentifier } = await acquireTransactionLock(
    supabase, 
    webhookData.transactionId!
  )

  if (!lockAcquired) {
    console.error('Failed to acquire transaction lock')
    return new Response('Transaction processing conflict', { status: 409 })
  }

  try {
    // Get and validate the payment transaction
    const { valid: transactionValid, transaction, isExpired } = await validateTransactionExists(
      supabase, 
      webhookData.transactionId!
    )

    if (!transactionValid) {
      console.error('Transaction not found:', webhookData.transactionId)
      return new Response('Transaction not found', { status: 404 })
    }

    if (isExpired) {
      await logTransactionExpired(
        supabase, 
        webhookData.transactionId!, 
        transaction, 
        webhookData, 
        securityContext
      )
      return new Response('Transaction expired', { status: 410 })
    }

    // Additional transaction security validation
    const { valid: securityValid, error: securityValidationError } = await validateTransactionSecurity(
      supabase,
      transaction,
      webhookData
    )

    if (!securityValid) {
      console.error('Transaction security validation failed:', securityValidationError)
      await logSecurityViolation(
        supabase,
        webhookData.transactionId!,
        'transaction_security_failed',
        { error: securityValidationError },
        { ...securityContext, transaction }
      )
      return new Response('Transaction security validation failed', { status: 403 })
    }

    // Add transaction to security context
    securityContext.transaction = transaction

    // Enhanced webhook processing start logging
    await logWebhookProcessingStart(
      supabase, 
      webhookData.transactionId!, 
      webhookData, 
      lockIdentifier!, 
      securityContext
    )

    // Create transaction update data
    const updateData = createTransactionUpdateData(
      webhookData.status!, 
      webhookData.monetbilTransactionId!
    )

    if (webhookData.status === '1') {
      // Payment successful - process ad creation
      const { success: adCreated, adId, error: adError } = await processSuccessfulPayment(
        supabase, 
        transaction, 
        webhookData.monetbilTransactionId!
      )

      if (!adCreated) {
        updateData.status = 'failed'
        console.error('Ad creation failed:', adError)
      } else {
        console.log('Ad created successfully:', adId)
      }

      await logAdCreationResult(
        supabase, 
        webhookData.transactionId!, 
        adCreated, 
        transaction.payment_data, 
        securityContext, 
        adId, 
        adError
      )
    } else {
      // Payment failed or cancelled
      console.log('Payment failed or cancelled, status:', webhookData.status)
      
      await logPaymentFailure(
        supabase, 
        webhookData.transactionId!, 
        webhookData.status!, 
        webhookData.monetbilTransactionId!, 
        securityContext
      )
    }

    // Update the transaction
    const { success: updateSuccess, error: updateError } = await updateTransactionStatus(
      supabase, 
      webhookData.transactionId!, 
      updateData
    )

    if (!updateSuccess) {
      console.error('Critical error updating transaction:', updateError)
      return new Response('Transaction update failed', { status: 500 })
    }

    // Enhanced successful webhook processing logging
    await logWebhookProcessingComplete(
      supabase, 
      webhookData.transactionId!, 
      updateData.status!, 
      { 
        ...securityContext, 
        signatureVerified: true,
        securityLevel: 'enhanced'
      }
    )

    console.log('Secure webhook processed successfully for transaction:', webhookData.transactionId)
    return new Response('OK', { status: 200 })

  } finally {
    // Always release the lock in the finally block
    if (lockIdentifier) {
      await releaseTransactionLock(supabase, webhookData.transactionId!, lockIdentifier)
    }
  }
}
