
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('Checking webhook rate limits for IP:', clientIP)
    
    const { data: ipRateLimit, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: clientIP,
        p_identifier_type: 'ip',
        p_action_type: 'webhook_call',
        p_max_requests: 50, // 50 webhook calls per hour per IP
        p_window_minutes: 60
      })

    if (rateLimitError) {
      console.error('Webhook rate limit check error:', rateLimitError)
    } else if (ipRateLimit && !ipRateLimit.allowed) {
      console.log('Webhook rate limit exceeded for IP:', clientIP, ipRateLimit)
      
      // Log security event for excessive webhook calls
      await supabase
        .from('payment_security_events')
        .insert({
          event_type: 'webhook_rate_limit_exceeded',
          severity: 'medium',
          identifier: clientIP,
          identifier_type: 'ip',
          event_data: {
            rate_limit_info: ipRateLimit,
            timestamp: new Date().toISOString()
          },
          risk_score: 40
        })

      return new Response('Rate limit exceeded', { status: 429 })
    }

    const formData = await req.formData()
    const status = formData.get('status')
    const transactionId = formData.get('item_ref')
    const monetbilTransactionId = formData.get('transaction_id')
    const signature = formData.get('signature')

    console.log('Enhanced webhook received:', { 
      status, 
      transactionId, 
      monetbilTransactionId,
      hasSignature: !!signature,
      clientIP,
      rateLimitInfo: ipRateLimit
    })

    if (!transactionId) {
      console.error('Missing transaction ID in webhook')
      return new Response('Missing transaction ID', { status: 400 })
    }

    // Enhanced suspicious activity detection for webhooks
    const webhookActivityData = {
      transaction_id: transactionId,
      monetbil_transaction_id: monetbilTransactionId,
      status,
      client_ip: clientIP,
      user_agent: userAgent,
      has_signature: !!signature,
      timestamp: new Date().toISOString()
    }

    const { data: suspiciousActivity, error: suspiciousActivityError } = await supabase
      .rpc('detect_suspicious_activity', {
        p_identifier: clientIP,
        p_identifier_type: 'ip',
        p_event_data: webhookActivityData
      })

    if (suspiciousActivityError) {
      console.error('Webhook suspicious activity detection error:', suspiciousActivityError)
    } else if (suspiciousActivity && suspiciousActivity.auto_block) {
      console.log('Suspicious webhook activity detected, blocking:', suspiciousActivity)
      return new Response('Webhook blocked due to suspicious activity', { status: 403 })
    }

    // Generate unique lock identifier for this webhook processing
    const lockIdentifier = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Try to acquire processing lock
    const { data: lockResult, error: lockError } = await supabase
      .rpc('acquire_transaction_lock', {
        transaction_uuid: transactionId,
        lock_identifier: lockIdentifier
      })

    if (lockError) {
      console.error('Error acquiring transaction lock:', lockError)
      return new Response('Lock acquisition failed', { status: 500 })
    }

    if (!lockResult) {
      console.log('Transaction already being processed or expired')
      return new Response('Transaction locked or expired', { status: 409 })
    }

    console.log('Successfully acquired transaction lock:', lockIdentifier)

    try {
      // Enhanced webhook verification with signature if provided
      if (signature) {
        const expectedSignature = await generateWebhookSignature(formData, serviceSecret)
        if (signature !== expectedSignature) {
          console.error('Invalid webhook signature')
          
          // Enhanced security violation logging
          await supabase
            .from('payment_security_events')
            .insert({
              event_type: 'webhook_signature_mismatch',
              severity: 'high',
              identifier: clientIP,
              identifier_type: 'ip',
              event_data: {
                transaction_id: transactionId,
                provided_signature: signature,
                expected_signature: expectedSignature,
                timestamp: new Date().toISOString()
              },
              risk_score: 70,
              auto_blocked: false
            })
          
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'security_violation',
              event_data: {
                violation_type: 'invalid_signature',
                provided_signature: signature,
                client_ip: clientIP,
                timestamp: new Date().toISOString(),
                suspicious_activity: suspiciousActivity
              },
              ip_address: clientIP,
              user_agent: userAgent,
              security_flags: { 
                'signature_mismatch': true,
                'high_risk': true
              }
            })
          
          return new Response('Invalid signature', { status: 401 })
        }
        console.log('Webhook signature verified successfully')
      }

      // Get the payment transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (transactionError || !transaction) {
        console.error('Transaction not found:', transactionError)
        return new Response('Transaction not found', { status: 404 })
      }

      // Check if transaction has expired
      const now = new Date()
      const expiresAt = new Date(transaction.expires_at)
      if (now > expiresAt) {
        console.log('Transaction has expired, marking as expired')
        
        await supabase
          .from('payment_transactions')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId)

        // Enhanced expiration logging
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'webhook_expired_transaction',
            event_data: {
              expired_at: now.toISOString(),
              original_expires_at: transaction.expires_at,
              webhook_status: status,
              security_context: {
                client_ip: clientIP,
                suspicious_activity: suspiciousActivity
              }
            },
            ip_address: clientIP,
            user_agent: userAgent,
            security_flags: { 'transaction_expired': true }
          })

        return new Response('Transaction expired', { status: 410 })
      }

      // Enhanced webhook processing start logging
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transactionId,
          event_type: 'webhook_processing_start',
          event_data: {
            status,
            monetbil_transaction_id: monetbilTransactionId,
            lock_identifier: lockIdentifier,
            timestamp: new Date().toISOString(),
            security_context: {
              client_ip: clientIP,
              user_agent: userAgent,
              security_score: transaction.security_score,
              suspicious_activity: suspiciousActivity,
              rate_limit_info: ipRateLimit
            }
          },
          ip_address: clientIP,
          user_agent: userAgent,
          security_flags: {
            'webhook_processing': true,
            'secure_transaction': transaction.security_score >= 80
          }
        })

      // Update transaction status
      const updateData: any = {
        monetbil_transaction_id: monetbilTransactionId,
        updated_at: new Date().toISOString()
      }

      if (status === '1') {
        // Payment successful
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()

        console.log('Payment successful, creating ad...')

        // Create the ad from stored data
        const adData = transaction.payment_data.adData
        const adType = transaction.payment_data.adType

        const { data: ad, error: adError } = await supabase
          .from('ads')
          .insert({
            title: adData.title,
            description: adData.description,
            category: adData.category,
            price: adData.price,
            region: adData.region,
            city: adData.city,
            phone: adData.phone,
            whatsapp: adData.whatsapp || null,
            status: "pending",
            ad_type: adType,
            user_id: transaction.user_id,
            payment_transaction_id: transaction.id
          })
          .select('id')
          .single()

        if (adError) {
          console.error('Error creating ad:', adError)
          updateData.status = 'failed'
          
          // Enhanced ad creation failure logging
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'ad_creation_failed',
              event_data: {
                error: adError.message,
                timestamp: new Date().toISOString(),
                security_context: {
                  transaction_security_score: transaction.security_score,
                  client_fingerprint: transaction.client_fingerprint
                }
              },
              ip_address: clientIP,
              user_agent: userAgent,
              security_flags: { 'ad_creation_failed': true }
            })
        } else {
          console.log('Ad created successfully:', ad.id)
          
          // Enhanced successful ad creation logging
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'ad_created_successfully',
              event_data: {
                ad_id: ad.id,
                ad_type: adType,
                timestamp: new Date().toISOString(),
                security_context: {
                  transaction_security_score: transaction.security_score,
                  client_fingerprint: transaction.client_fingerprint,
                  verified_payment: true
                }
              },
              ip_address: clientIP,
              user_agent: userAgent,
              security_flags: { 
                'ad_created': true,
                'secure_payment': true
              }
            })
          
          // Handle images if present
          if (adData.images && adData.images.length > 0) {
            console.log('Note: Images will need to be handled separately')
          }
        }
      } else {
        // Payment failed or cancelled
        updateData.status = 'failed'
        console.log('Payment failed or cancelled, status:', status)
        
        // Enhanced payment failure logging
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'payment_failed',
            event_data: {
              monetbil_status: status,
              monetbil_transaction_id: monetbilTransactionId,
              timestamp: new Date().toISOString(),
              security_context: {
                client_ip: clientIP,
                user_agent: userAgent,
                transaction_security_score: transaction.security_score
              }
            },
            ip_address: clientIP,
            user_agent: userAgent,
            security_flags: { 'payment_failed': true }
          })
      }

      // Update the transaction
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('id', transactionId)

      if (updateError) {
        console.error('Error updating transaction:', updateError)
        return new Response('Error updating transaction', { status: 500 })
      }

      // Enhanced successful webhook processing logging
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transactionId,
          event_type: 'webhook_processing_complete',
          event_data: {
            final_status: updateData.status,
            timestamp: new Date().toISOString(),
            security_summary: {
              client_ip: clientIP,
              transaction_security_score: transaction.security_score,
              signature_verified: !!signature,
              suspicious_activity_risk: suspiciousActivity?.risk_score || 0,
              rate_limit_status: ipRateLimit
            }
          },
          ip_address: clientIP,
          user_agent: userAgent,
          security_flags: { 
            'processing_complete': true,
            'secure_processing': true
          }
        })

      console.log('Enhanced secure webhook processed successfully for transaction:', transactionId)
      return new Response('OK', { status: 200 })

    } finally {
      // Always release the lock in the finally block
      try {
        const { error: unlockError } = await supabase
          .rpc('release_transaction_lock', {
            transaction_uuid: transactionId,
            lock_identifier: lockIdentifier
          })
        
        if (unlockError) {
          console.error('Error releasing transaction lock:', unlockError)
        } else {
          console.log('Successfully released transaction lock:', lockIdentifier)
        }
      } catch (unlockError) {
        console.error('Failed to release lock:', unlockError)
      }
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

// Helper function to generate webhook signature for verification
async function generateWebhookSignature(formData: FormData, secret: string): Promise<string> {
  try {
    // Create a string from form data for signature generation
    const sortedParams = Array.from(formData.entries())
      .filter(([key]) => key !== 'signature')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    
    const dataToSign = sortedParams + secret
    
    // Generate SHA256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(dataToSign)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex
  } catch (error) {
    console.error('Error generating signature:', error)
    return ''
  }
}
