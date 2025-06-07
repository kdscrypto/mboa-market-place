
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
    throw new Error('Unauthorized')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function checkRateLimit(
  supabase: any, 
  identifier: string, 
  identifierType: string, 
  maxRequests: number = 5,
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
    return { allowed: true } // Fail open in case of error
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
  const { data: suspiciousActivity, error } = await supabase
    .rpc('detect_suspicious_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: eventData
    })

  if (error) {
    console.error('Suspicious activity detection error:', error)
    return { risk_score: 0, severity: 'low', auto_block: false, event_type: 'unknown' }
  }

  return suspiciousActivity || { risk_score: 0, severity: 'low', auto_block: false, event_type: 'unknown' }
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
    score -= Math.floor(userLimitRatio * 20) // Up to 20 points reduction
  }

  if (ipRateLimit?.current_count) {
    const ipLimitRatio = ipRateLimit.current_count / ipRateLimit.max_requests
    score -= Math.floor(ipLimitRatio * 15) // Up to 15 points reduction
  }

  return Math.max(0, Math.min(100, score)) // Ensure score is between 0 and 100
}

export async function generateClientFingerprint(userAgent: string, clientIP: string): Promise<string> {
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
