
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
    // Take the first valid IPv4 or IPv6 address
    const validIP = ips.find(ip => {
      // Check for valid IPv4
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
        const octets = ip.split('.').map(Number)
        return octets.every(octet => octet >= 0 && octet <= 255)
      }
      // Check for valid IPv6 (basic check)
      return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip) || 
             /^::1$/.test(ip) || 
             /^::$/.test(ip)
    })
    if (validIP) {
      clientIP = validIP
    }
  } else if (realIP) {
    clientIP = realIP
  } else if (remoteAddr) {
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
    // Use the Supabase function for rate limiting
    const { data: rateLimitResult, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: 'payment',
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    })

    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true } // Fail open for now
    }

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.blocked_until 
        ? Math.ceil((new Date(rateLimitResult.blocked_until).getTime() - Date.now()) / 1000)
        : 60
      return { allowed: false, retryAfter: Math.max(retryAfter, 60) }
    }

    return { allowed: true }
  } catch (err) {
    console.error('Rate limiting error:', err)
    return { allowed: true } // Fail open on errors
  }
}

export async function detectSuspiciousActivity(
  supabase: any,
  identifier: string,
  identifierType: string,
  activityData: any
): Promise<SuspiciousActivityResult> {
  try {
    // Use the Supabase function for suspicious activity detection
    const { data: result, error } = await supabase.rpc('detect_suspicious_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: activityData
    })

    if (error) {
      console.error('Suspicious activity detection error:', error)
      return { auto_block: false, risk_score: 0 }
    }

    return {
      auto_block: result.auto_block || false,
      risk_score: result.risk_score || 0
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
