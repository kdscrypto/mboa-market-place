
export interface SecurityContext {
  clientIP: string
  userAgent: string
}

export interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
}

export interface SuspiciousActivityResult {
  auto_block: boolean
  risk_score: number
}

export async function extractSecurityInfo(req: Request): Promise<SecurityContext> {
  // Extract and clean IP address - take only the first valid IP
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const remoteAddr = req.headers.get('cf-connecting-ip')
  
  let clientIP = '127.0.0.1' // Default fallback
  
  // Parse X-Forwarded-For header which can contain multiple IPs
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    // Take the first valid IPv4 address
    const validIP = ips.find(ip => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip))
    if (validIP) {
      clientIP = validIP
    }
  } else if (realIP && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(realIP)) {
    clientIP = realIP
  } else if (remoteAddr && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(remoteAddr)) {
    clientIP = remoteAddr
  }
  
  const userAgent = req.headers.get('user-agent') || 'Unknown'
  
  console.log('Extracted security info:', { clientIP, userAgent: userAgent.substring(0, 50) + '...' })
  
  return { clientIP, userAgent }
}

export async function verifyUserAuthentication(supabase: any, authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Token d\'authentification manquant')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('Authentication error:', error)
    throw new Error('Token d\'authentification invalide')
  }

  return user
}

export async function checkRateLimit(
  supabase: any,
  identifier: string,
  identifierType: string,
  maxRequests: number,
  windowMinutes: number
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
  
  console.log(`Checking rate limit for ${identifierType}: ${identifier}`)
  
  try {
    const { data: rateLimits, error } = await supabase
      .from('payment_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('identifier_type', identifierType)
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })

    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true }
    }

    const totalRequests = rateLimits?.reduce((sum: number, limit: any) => sum + limit.request_count, 0) || 0
    
    if (totalRequests >= maxRequests) {
      const retryAfter = Math.ceil((new Date(rateLimits[0]?.window_start).getTime() + windowMinutes * 60 * 1000 - Date.now()) / 1000)
      return { allowed: false, retryAfter: Math.max(retryAfter, 60) }
    }

    // Update or create rate limit record
    const now = new Date().toISOString()
    const { error: upsertError } = await supabase
      .from('payment_rate_limits')
      .upsert({
        identifier,
        identifier_type: identifierType,
        action_type: 'payment_attempt',
        request_count: 1,
        window_start: now,
        updated_at: now
      }, {
        onConflict: 'identifier,identifier_type,action_type',
        ignoreDuplicates: false
      })

    if (upsertError) {
      console.error('Rate limit update error:', upsertError)
    }

    return { allowed: true }
  } catch (err) {
    console.error('Rate limiting error:', err)
    return { allowed: true }
  }
}

export async function detectSuspiciousActivity(
  supabase: any,
  identifier: string,
  identifierType: string,
  activityData: any
): Promise<SuspiciousActivityResult> {
  try {
    let riskScore = 0
    
    // Check for rapid successive requests
    const recentActivity = await supabase
      .from('payment_security_events')
      .select('*')
      .eq('identifier', identifier)
      .eq('identifier_type', identifierType)
      .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentActivity.data && recentActivity.data.length > 5) {
      riskScore += 30
    }

    // Check for amount anomalies
    if (activityData.amount > 50000) { // Very high amount
      riskScore += 20
    }

    // Log security event
    await supabase
      .from('payment_security_events')
      .insert({
        identifier,
        identifier_type: identifierType,
        event_type: 'payment_attempt',
        severity: riskScore > 50 ? 'high' : riskScore > 20 ? 'medium' : 'low',
        risk_score: riskScore,
        event_data: activityData,
        auto_blocked: riskScore > 80
      })

    return {
      auto_block: riskScore > 80,
      risk_score: riskScore
    }
  } catch (err) {
    console.error('Suspicious activity detection error:', err)
    return { auto_block: false, risk_score: 0 }
  }
}

export function calculateSecurityScore(
  suspiciousActivity: SuspiciousActivityResult,
  userRateLimit: RateLimitResult,
  ipRateLimit: RateLimitResult
): number {
  let score = 100
  
  // Deduct based on suspicious activity
  score -= suspiciousActivity.risk_score
  
  // Deduct if approaching rate limits
  if (!userRateLimit.allowed) score -= 30
  if (!ipRateLimit.allowed) score -= 20
  
  return Math.max(score, 0)
}

export async function generateClientFingerprint(userAgent: string, clientIP: string): Promise<string> {
  // Create a simple fingerprint from user agent and IP
  const data = userAgent + clientIP + Date.now().toString()
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}
