
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract security information
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Enhanced rate limiting - check both user and IP
    console.log('Checking rate limits for user and IP...')
    
    // Check user-based rate limiting
    const { data: userRateLimit, error: userRateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: user.id,
        p_identifier_type: 'user',
        p_action_type: 'payment_request',
        p_max_requests: 5, // 5 payment requests per hour per user
        p_window_minutes: 60
      })

    if (userRateLimitError) {
      console.error('User rate limit check error:', userRateLimitError)
    } else if (userRateLimit && !userRateLimit.allowed) {
      console.log('User rate limit exceeded:', userRateLimit)
      return new Response(
        JSON.stringify({ 
          error: 'Trop de tentatives de paiement. Veuillez réessayer plus tard.',
          retryAfter: userRateLimit.blocked_until
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check IP-based rate limiting
    const { data: ipRateLimit, error: ipRateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: clientIP,
        p_identifier_type: 'ip',
        p_action_type: 'payment_request',
        p_max_requests: 10, // 10 payment requests per hour per IP
        p_window_minutes: 60
      })

    if (ipRateLimitError) {
      console.error('IP rate limit check error:', ipRateLimitError)
    } else if (ipRateLimit && !ipRateLimit.allowed) {
      console.log('IP rate limit exceeded:', ipRateLimit)
      return new Response(
        JSON.stringify({ 
          error: 'Trop de tentatives de paiement depuis cette adresse IP. Veuillez réessayer plus tard.',
          retryAfter: ipRateLimit.blocked_until
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { adData, adType } = await req.json()
    console.log('Payment request received:', { userId: user.id, adType, adData: adData.title, clientIP })

    // Get plan pricing (using validation that will be caught by the trigger)
    const planPrices: Record<string, number> = {
      'standard': 0,
      'premium_24h': 1000,
      'premium_7d': 5000,
      'premium_15d': 10000,
      'premium_30d': 15000,
    }

    const amount = planPrices[adType] || 0

    // Enhanced suspicious activity detection
    const suspiciousActivityData = {
      user_id: user.id,
      amount,
      ad_type: adType,
      client_ip: clientIP,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    }

    const { data: suspiciousActivity, error: suspiciousActivityError } = await supabase
      .rpc('detect_suspicious_activity', {
        p_identifier: user.id,
        p_identifier_type: 'user',
        p_event_data: suspiciousActivityData
      })

    if (suspiciousActivityError) {
      console.error('Suspicious activity detection error:', suspiciousActivityError)
    } else if (suspiciousActivity && suspiciousActivity.auto_block) {
      console.log('Suspicious activity detected, blocking transaction:', suspiciousActivity)
      return new Response(
        JSON.stringify({ 
          error: 'Transaction bloquée pour des raisons de sécurité. Veuillez contacter le support.',
          securityCode: 'BLOCKED_SUSPICIOUS'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For standard ads (free), process directly
    if (amount === 0) {
      console.log('Processing free standard ad...')
      
      // Create the ad directly
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
          user_id: user.id
        })
        .select('id')
        .single()

      if (adError) {
        console.error('Error creating ad:', adError)
        throw new Error('Failed to create ad')
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          adId: ad.id, 
          paymentRequired: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For premium ads, create payment transaction with enhanced security features
    console.log('Creating secure payment transaction for premium ad...')
    
    const returnUrl = `${req.headers.get('origin')}/payment-return`
    const cancelUrl = `${req.headers.get('origin')}/publier-annonce`
    const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/monetbil-webhook`

    // Generate client fingerprint for additional security
    const clientFingerprint = await generateClientFingerprint(userAgent, clientIP)

    // Calculate security score based on various factors
    const securityScore = calculateSecurityScore(suspiciousActivity, userRateLimit, ipRateLimit)

    // Create payment transaction record with enhanced security
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
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
        // expires_at will be set automatically by the trigger
      })
      .select('id, expires_at')
      .single()

    if (transactionError) {
      console.error('Error creating payment transaction:', transactionError)
      throw new Error('Failed to create payment transaction: ' + transactionError.message)
    }

    console.log('Payment transaction created with enhanced security:', {
      id: transaction.id,
      expires_at: transaction.expires_at,
      security_score: securityScore,
      client_fingerprint: clientFingerprint
    })

    // Enhanced audit logging with security context
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'transaction_created',
        event_data: {
          user_id: user.id,
          amount,
          ad_type: adType,
          ip_address: clientIP,
          user_agent: userAgent,
          security_score: securityScore,
          rate_limit_user: userRateLimit,
          rate_limit_ip: ipRateLimit,
          suspicious_activity: suspiciousActivity,
          client_fingerprint: clientFingerprint
        },
        ip_address: clientIP,
        user_agent: userAgent,
        security_flags: {
          rate_limited: false,
          suspicious_detected: suspiciousActivity?.risk_score > 30,
          high_security_score: securityScore >= 80
        }
      })

    // Get Monetbil API credentials
    const serviceKey = Deno.env.get('MONETBIL_SERVICE_KEY')
    const serviceSecret = Deno.env.get('MONETBIL_SERVICE_SECRET')

    if (!serviceKey || !serviceSecret) {
      console.error('Monetbil API credentials not configured')
      throw new Error('Payment service not properly configured')
    }

    // Prepare Monetbil payment request
    const monetbilData = {
      service: serviceKey,
      amount: amount.toString(),
      phone: adData.phone,
      locale: 'fr',
      currency: 'XAF',
      return: returnUrl,
      cancel: cancelUrl,
      notify: notifyUrl,
      item_ref: transaction.id,
      payment_ref: `MBOA_${transaction.id}`,
      user: user.id,
      first_name: 'Utilisateur',
      last_name: 'MBOA',
      email: user.email || `${user.id}@mboa.cm`
    }

    console.log('Sending request to Monetbil with enhanced security logging')

    // Call Monetbil API
    const formBody = new URLSearchParams()
    Object.entries(monetbilData).forEach(([key, value]) => {
      formBody.append(key, value)
    })

    const monetbilResponse = await fetch('https://api.monetbil.com/widget/v2.1/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Service-Secret': serviceSecret,
      },
      body: formBody.toString()
    })

    const monetbilResult = await monetbilResponse.text()
    console.log('Monetbil API response status:', monetbilResponse.status)

    if (!monetbilResponse.ok) {
      console.error('Monetbil API error:', monetbilResult)
      
      // Enhanced API error logging
      await supabase
        .from('payment_audit_logs')
        .insert({
          transaction_id: transaction.id,
          event_type: 'monetbil_api_error',
          event_data: {
            status: monetbilResponse.status,
            error: monetbilResult,
            timestamp: new Date().toISOString(),
            security_context: {
              client_ip: clientIP,
              user_agent: userAgent,
              security_score: securityScore
            }
          },
          ip_address: clientIP,
          user_agent: userAgent,
          security_flags: { 'api_error': true }
        })
      
      throw new Error(`Monetbil API error: ${monetbilResponse.status}`)
    }

    // Update transaction with Monetbil response
    await supabase
      .from('payment_transactions')
      .update({
        monetbil_payment_token: monetbilResult,
        payment_url: `https://api.monetbil.com/widget/v2.1/${monetbilResult}`
      })
      .eq('id', transaction.id)

    // Enhanced success logging
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transaction.id,
        event_type: 'payment_initiated',
        event_data: {
          monetbil_token: monetbilResult,
          timestamp: new Date().toISOString(),
          security_context: {
            security_score: securityScore,
            client_fingerprint: clientFingerprint,
            suspicious_activity_risk: suspiciousActivity?.risk_score || 0
          }
        },
        ip_address: clientIP,
        user_agent: userAgent,
        security_flags: { 'payment_initiated': true }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentRequired: true,
        paymentUrl: `https://api.monetbil.com/widget/v2.1/${monetbilResult}`,
        transactionId: transaction.id,
        expiresAt: transaction.expires_at,
        securityScore: securityScore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Helper function to generate client fingerprint
async function generateClientFingerprint(userAgent: string, clientIP: string): Promise<string> {
  try {
    const data = `${userAgent}|${clientIP}|${Date.now()}`
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
  } catch (error) {
    console.error('Error generating client fingerprint:', error)
    return 'unknown'
  }
}

// Helper function to calculate security score
function calculateSecurityScore(suspiciousActivity: any, userRateLimit: any, ipRateLimit: any): number {
  let score = 100 // Start with perfect score

  // Reduce score based on suspicious activity
  if (suspiciousActivity?.risk_score) {
    score -= suspiciousActivity.risk_score
  }

  // Reduce score based on rate limit proximity
  if (userRateLimit?.current_count) {
    const userLimitRatio = userRateLimit.current_count / userRateLimit.max_requests
    score -= Math.floor(userLimitRatio * 20) // Up to 20 points reduction
  }

  if (ipRateLimit?.current_count) {
    const ipLimitRatio = ipRateLimit.current_count / ipRateLimit.max_requests
    score -= Math.floor(ipLimitRatio * 15) // Up to 15 points reduction
  }

  return Math.max(0, Math.min(100, score)) // Ensure score is between 0 and 100
}
