
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

    const formData = await req.formData()
    const status = formData.get('status')
    const transactionId = formData.get('item_ref')
    const monetbilTransactionId = formData.get('transaction_id')
    const signature = formData.get('signature')

    // Extract security information for audit logging
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log('Secure webhook received:', { 
      status, 
      transactionId, 
      monetbilTransactionId,
      hasSignature: !!signature,
      clientIP
    })

    if (!transactionId) {
      console.error('Missing transaction ID in webhook')
      return new Response('Missing transaction ID', { status: 400 })
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
          
          // Log security violation
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'security_violation',
              event_data: {
                violation_type: 'invalid_signature',
                provided_signature: signature,
                client_ip: clientIP,
                timestamp: new Date().toISOString()
              },
              ip_address: clientIP,
              user_agent: userAgent,
              security_flags: { 'signature_mismatch': true }
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

        // Log expiration
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'webhook_expired_transaction',
            event_data: {
              expired_at: now.toISOString(),
              original_expires_at: transaction.expires_at,
              webhook_status: status
            },
            ip_address: clientIP,
            user_agent: userAgent
          })

        return new Response('Transaction expired', { status: 410 })
      }

      // Log webhook processing start
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transactionId,
          event_type: 'webhook_processing_start',
          event_data: {
            status,
            monetbil_transaction_id: monetbilTransactionId,
            lock_identifier: lockIdentifier,
            timestamp: new Date().toISOString()
          },
          ip_address: clientIP,
          user_agent: userAgent
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
          
          // Log ad creation failure
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'ad_creation_failed',
              event_data: {
                error: adError.message,
                timestamp: new Date().toISOString()
              },
              ip_address: clientIP,
              user_agent: userAgent
            })
        } else {
          console.log('Ad created successfully:', ad.id)
          
          // Log successful ad creation
          await supabase
            .from('payment_audit_logs')
            .insert({
              transaction_id: transactionId,
              event_type: 'ad_created_successfully',
              event_data: {
                ad_id: ad.id,
                ad_type: adType,
                timestamp: new Date().toISOString()
              },
              ip_address: clientIP,
              user_agent: userAgent
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
        
        // Log payment failure
        await supabase
          .from('payment_audit_logs')
          .insert({
            transaction_id: transactionId,
            event_type: 'payment_failed',
            event_data: {
              monetbil_status: status,
              monetbil_transaction_id: monetbilTransactionId,
              timestamp: new Date().toISOString()
            },
            ip_address: clientIP,
            user_agent: userAgent
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

      // Log successful webhook processing
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transactionId,
          event_type: 'webhook_processing_complete',
          event_data: {
            final_status: updateData.status,
            timestamp: new Date().toISOString()
          },
          ip_address: clientIP,
          user_agent: userAgent
        })

      console.log('Secure webhook processed successfully for transaction:', transactionId)
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
