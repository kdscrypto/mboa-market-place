
export interface AuditLogData {
  transaction_id: string
  event_type: string
  event_data: any
  ip_address?: string
  user_agent?: string
  security_flags?: any
}

export async function logAuditEvent(supabase: any, logData: AuditLogData): Promise<void> {
  try {
    await supabase
      .from('payment_audit_logs')
      .insert(logData)
  } catch (error) {
    console.error('Failed to log audit event:', error)
    // Don't throw here to avoid breaking the main flow
  }
}

export async function logTransactionCreated(
  supabase: any,
  transactionId: string,
  userId: string,
  amount: number,
  adType: string,
  clientIP: string,
  userAgent: string,
  securityScore: number,
  userRateLimit: any,
  ipRateLimit: any,
  suspiciousActivity: any,
  clientFingerprint: string
): Promise<void> {
  await logAuditEvent(supabase, {
    transaction_id: transactionId,
    event_type: 'transaction_created',
    event_data: {
      user_id: userId,
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
}

export async function logMonetbilApiError(
  supabase: any,
  transactionId: string,
  status: number,
  error: string,
  clientIP: string,
  userAgent: string,
  securityScore: number
): Promise<void> {
  await logAuditEvent(supabase, {
    transaction_id: transactionId,
    event_type: 'monetbil_api_error',
    event_data: {
      status,
      error,
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
}

export async function logPaymentInitiated(
  supabase: any,
  transactionId: string,
  monetbilToken: string,
  securityScore: number,
  clientFingerprint: string,
  suspiciousActivity: any,
  clientIP: string,
  userAgent: string
): Promise<void> {
  await logAuditEvent(supabase, {
    transaction_id: transactionId,
    event_type: 'payment_initiated',
    event_data: {
      monetbil_token: monetbilToken,
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
}
