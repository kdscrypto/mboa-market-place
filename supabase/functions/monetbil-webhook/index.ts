
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import modular functions
import { 
  parseWebhookFormData, 
  validateWebhookSignature, 
  validateRequiredFields 
} from "./modules/webhookValidation.ts"
import { 
  checkWebhookRateLimit, 
  detectSuspiciousWebhookActivity, 
  logSecurityViolation 
} from "./modules/webhookSecurity.ts"
import { 
  acquireTransactionLock, 
  releaseTransactionLock 
} from "./modules/transactionLocking.ts"
import { 
  validateTransactionExists, 
  processSuccessfulPayment, 
  updateTransactionStatus, 
  createTransactionUpdateData 
} from "./modules/webhookProcessing.ts"
import { 
  logWebhookProcessingStart, 
  logTransactionExpired, 
  logAdCreationResult, 
  logPaymentFailure, 
  logWebhookProcessingComplete 
} from "./modules/webhookAuditLogging.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Monetbil credentials for webhook verification
    const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')
    
    if (!serviceSecret) {
      console.error('Monetbil service secret not configured')
      return new Response('Service not properly configured', { status: 500 })
    }

    // Extract security information for enhanced audit logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Enhanced rate limiting for webhook calls
    const { allowed: rateLimitAllowed, rateLimitInfo } = await checkWebhookRateLimit(supabase, clientIP)
    
    if (!rateLimitAllowed) {
      return new Response('Rate limit exceeded', { status: 429 })
    }

    // Parse webhook form data
    const formData = await req.formData()
    const webhookData = await parseWebhookFormData(req)

    console.log('Enhanced webhook received:', { 
      status: webhookData.status, 
      transactionId: webhookData.transactionId, 
      monetbilTransactionId: webhookData.monetbilTransactionId,
      hasSignature: !!webhookData.signature,
      clientIP,
      rateLimitInfo
    })

    // Validate required fields
    const validationError = validateRequiredFields(webhookData)
    if (validationError) {
      console.error(validationError)
      return new Response(validationError, { status: 400 })
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
      return new Response('Webhook blocked due to suspicious activity', { status: 403 })
    }

    securityContext.suspiciousActivity = activityData

    // Acquire processing lock
    const { acquired: lockAcquired, lockIdentifier } = await acquireTransactionLock(
      supabase, 
      webhookData.transactionId!
    )

    if (!lockAcquired) {
      return new Response('Transaction locked or expired', { status: 409 })
    }

    try {
      // Enhanced webhook verification with signature if provided
      if (webhookData.signature) {
        const isValidSignature = await validateWebhookSignature(
          formData, 
          webhookData.signature, 
          serviceSecret
        )
        
        if (!isValidSignature) {
          console.error('Invalid webhook signature')
          
          await logSecurityViolation(
            supabase,
            webhookData.transactionId!,
            'signature_mismatch',
            {
              provided_signature: webhookData.signature,
              timestamp: new Date().toISOString()
            },
            securityContext
          )
          
          return new Response('Invalid signature', { status: 401 })
        }
        console.log('Webhook signature verified successfully')
      }

      // Get and validate the payment transaction
      const { valid: transactionValid, transaction, isExpired } = await validateTransactionExists(
        supabase, 
        webhookData.transactionId!
      )

      if (!transactionValid) {
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
        console.error('Error updating transaction:', updateError)
        return new Response('Error updating transaction', { status: 500 })
      }

      // Enhanced successful webhook processing logging
      await logWebhookProcessingComplete(
        supabase, 
        webhookData.transactionId!, 
        updateData.status!, 
        { 
          ...securityContext, 
          signatureVerified: !!webhookData.signature 
        }
      )

      console.log('Enhanced secure webhook processed successfully for transaction:', webhookData.transactionId)
      return new Response('OK', { status: 200 })

    } finally {
      // Always release the lock in the finally block
      if (lockIdentifier) {
        await releaseTransactionLock(supabase, webhookData.transactionId!, lockIdentifier)
      }
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
