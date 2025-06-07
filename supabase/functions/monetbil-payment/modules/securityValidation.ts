
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface SecurityContext {
  clientIP: string
  userAgent: string
  user: any
}

export interface RateLimitResult {
  allowed: boolean
  current_count?: number
  max_requests?: number
  blocked_until?: string
  retryAfter?: string
}

export interface SuspiciousActivityResult {
  risk_score: number
  severity: string
  auto_block: boolean
  event_type: string
}

export async function extractSecurityInfo(req: Request): Promise<Omit<SecurityContext, 'user'>> {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  
  return { clientIP, userAgent }
}

export async function verifyUserAuthentication(supabase: any, authHeader: string | null): Promise<any> {
  if (!authHeader) {
    throw new Error('Authentication required - missing authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token || token.length < 10) {
    throw new Error('Invalid authentication token format')
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    console.error('Authentication failed:', authError)
    throw new Error('Authentication failed - invalid or expired token')
  }
  
  return user
}

export async function checkRateLimit(
  supabase: any, 
  identifier: string, 
  identifierType: string, 
  maxRequests: number = 3, // Reduced from 5 to 3
  windowMinutes: number = 60
): Promise<RateLimitResult> {
  const { data: rateLimit, error } = await supabase
    .rpc('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: 'payment_request',
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    })

  if (error) {
    console.error(`Rate limit check error for ${identifierType}:`, error)
    // Fail secure - if we can't check rate limits, block the request
    return { 
      allowed: false, 
      retryAfter: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }
  }

  if (rateLimit && !rateLimit.allowed) {
    return {
      allowed: false,
      retryAfter: rateLimit.blocked_until
    }
  }

  return { allowed: true, ...rateLimit }
}

export async function detectSuspiciousActivity(
  supabase: any,
  identifier: string,
  identifierType: string,
  eventData: any
): Promise<SuspiciousActivityResult> {
  
  // Enhanced event data with security markers
  const enhancedEventData = {
    ...eventData,
    timestamp: new Date().toISOString(),
    security_check_version: '2.0'
  };

  const { data: suspiciousActivity, error } = await supabase
    .rpc('detect_suspicious_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: enhancedEventData
    })

  if (error) {
    console.error('Suspicious activity detection error:', error)
    // Fail secure - if we can't detect suspicious activity, treat as suspicious
    return { 
      risk_score: 60, 
      severity: 'high', 
      auto_block: true, 
      event_type: 'detection_failure' 
    }
  }

  return suspiciousActivity || { 
    risk_score: 0, 
    severity: 'low', 
    auto_block: false, 
    event_type: 'normal' 
  }
}

export function calculateSecurityScore(suspiciousActivity: any, userRateLimit: any, ipRateLimit: any): number {
  let score = 100 // Start with perfect score

  // Reduce score based on suspicious activity
  if (suspiciousActivity?.risk_score) {
    score -= suspiciousActivity.risk_score
  }

  // Reduce score based on rate limit proximity
  if (userRateLimit?.current_count) {
    const userLimitRatio = userRateLimit.current_count / userRateLimit.max_requests
    score -= Math.floor(userLimitRatio * 25) // Increased penalty
  }

  if (ipRateLimit?.current_count) {
    const ipLimitRatio = ipRateLimit.current_count / ipRateLimit.max_requests
    score -= Math.floor(ipLimitRatio * 20) // Increased penalty
  }

  return Math.max(0, Math.min(100, score)) // Ensure score is between 0 and 100
}

export async function generateClientFingerprint(userAgent: string, clientIP: string): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute windows
    const data = `${userAgent}|${clientIP}|${timestamp}`
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
  } catch (error) {
    console.error('Error generating client fingerprint:', error)
    throw new Error('Failed to generate client fingerprint')
  }
}

export async function validatePaymentAmount(amount: number): Promise<{ valid: boolean; error?: string }> {
  // Strict amount validation
  if (!Number.isInteger(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be a positive integer' }
  }

  // Minimum amount check (e.g., 100 XAF minimum)
  if (amount < 100) {
    return { valid: false, error: 'Amount is below minimum threshold (100 XAF)' }
  }

  // Maximum amount check (e.g., 1M XAF maximum)
  if (amount > 1000000) {
    return { valid: false, error: 'Amount exceeds maximum threshold (1,000,000 XAF)' }
  }

  return { valid: true }
}

export async function validateAdTypeAndAmount(adType: string, amount: number): Promise<{ valid: boolean; error?: string }> {
  // Define expected amounts for each ad type
  const validAmounts: Record<string, number> = {
    'standard': 0,
    'premium_24h': 1000,
    'premium_7d': 5000,
    'premium_15d': 10000,
    'premium_30d': 18000
  }

  if (!validAmounts.hasOwnProperty(adType)) {
    return { valid: false, error: `Invalid ad type: ${adType}` }
  }

  const expectedAmount = validAmounts[adType]
  if (amount !== expectedAmount) {
    return { 
      valid: false, 
      error: `Amount mismatch for ${adType}: expected ${expectedAmount}, got ${amount}` 
    }
  }

  return { valid: true }
}
