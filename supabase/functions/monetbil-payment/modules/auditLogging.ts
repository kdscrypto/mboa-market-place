
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
  try {
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'transaction_created',
        event_data: {
          user_id: userId,
          amount,
          ad_type: adType,
          security_score: securityScore,
          rate_limits: { user: userRateLimit, ip: ipRateLimit },
          suspicious_activity: suspiciousActivity,
          client_fingerprint: clientFingerprint,
          timestamp: new Date().toISOString()
        },
        ip_address: clientIP,
        user_agent: userAgent,
        security_flags: {
          security_score: securityScore,
          suspicious_activity_detected: suspiciousActivity.auto_block,
          rate_limit_status: {
            user_allowed: userRateLimit.allowed,
            ip_allowed: ipRateLimit.allowed
          }
        }
      })
  } catch (error) {
    console.error('Failed to log transaction creation:', error)
    // Don't throw - logging failures shouldn't break the payment flow
  }
}

export async function logMonetbilApiError(
  supabase: any,
  transactionId: string,
  statusCode: number,
  errorMessage: string,
  clientIP: string,
  userAgent: string,
  securityScore: number
): Promise<void> {
  try {
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'monetbil_api_error',
        event_data: {
          status_code: statusCode,
          error_message: errorMessage,
          security_score: securityScore,
          timestamp: new Date().toISOString(),
          retry_attempt: true
        },
        ip_address: clientIP,
        user_agent: userAgent,
        security_flags: {
          api_error: true,
          error_code: statusCode,
          requires_investigation: statusCode >= 500
        }
      })
  } catch (error) {
    console.error('Failed to log Monetbil API error:', error)
    // Don't throw - logging failures shouldn't break error handling
  }
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
  try {
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'payment_initiated',
        event_data: {
          monetbil_token: monetbilToken.substring(0, 10) + '...',
          security_score: securityScore,
          client_fingerprint: clientFingerprint,
          suspicious_activity_score: suspiciousActivity.risk_score,
          timestamp: new Date().toISOString(),
          token_length: monetbilToken.length
        },
        ip_address: clientIP,
        user_agent: userAgent,
        security_flags: {
          payment_initiated: true,
          security_validated: true,
          token_format_valid: /^[a-zA-Z0-9_-]+$/.test(monetbilToken)
        }
      })
  } catch (error) {
    console.error('Failed to log payment initiation:', error)
    // Don't throw - logging failures shouldn't break the payment flow
  }
}
