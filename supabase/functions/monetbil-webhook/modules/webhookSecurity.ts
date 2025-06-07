
export interface SecurityContext {
  clientIP: string;
  userAgent: string;
  rateLimitInfo: any;
  suspiciousActivity: any;
}

export async function checkWebhookRateLimit(
  supabase: any,
  clientIP: string
): Promise<{ allowed: boolean; rateLimitInfo: any }> {
  console.log('Checking webhook rate limits for IP:', clientIP);
  
  const { data: ipRateLimit, error: rateLimitError } = await supabase
    .rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_identifier_type: 'ip',
      p_action_type: 'webhook_call',
      p_max_requests: 50, // 50 webhook calls per hour per IP
      p_window_minutes: 60
    });

  if (rateLimitError) {
    console.error('Webhook rate limit check error:', rateLimitError);
    return { allowed: true, rateLimitInfo: null };
  }

  if (ipRateLimit && !ipRateLimit.allowed) {
    console.log('Webhook rate limit exceeded for IP:', clientIP, ipRateLimit);
    
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
      });

    return { allowed: false, rateLimitInfo: ipRateLimit };
  }

  return { allowed: true, rateLimitInfo: ipRateLimit };
}

export async function detectSuspiciousWebhookActivity(
  supabase: any,
  webhookData: any,
  securityContext: SecurityContext
): Promise<{ suspicious: boolean; shouldBlock: boolean; activityData: any }> {
  const webhookActivityData = {
    transaction_id: webhookData.transactionId,
    monetbil_transaction_id: webhookData.monetbilTransactionId,
    status: webhookData.status,
    client_ip: securityContext.clientIP,
    user_agent: securityContext.userAgent,
    has_signature: !!webhookData.signature,
    timestamp: new Date().toISOString()
  };

  const { data: suspiciousActivity, error: suspiciousActivityError } = await supabase
    .rpc('detect_suspicious_activity', {
      p_identifier: securityContext.clientIP,
      p_identifier_type: 'ip',
      p_event_data: webhookActivityData
    });

  if (suspiciousActivityError) {
    console.error('Webhook suspicious activity detection error:', suspiciousActivityError);
    return { suspicious: false, shouldBlock: false, activityData: null };
  }

  if (suspiciousActivity && suspiciousActivity.auto_block) {
    console.log('Suspicious webhook activity detected, blocking:', suspiciousActivity);
    return { suspicious: true, shouldBlock: true, activityData: suspiciousActivity };
  }

  return { suspicious: false, shouldBlock: false, activityData: suspiciousActivity };
}

export async function logSecurityViolation(
  supabase: any,
  transactionId: string,
  violationType: string,
  violationData: any,
  securityContext: SecurityContext
): Promise<void> {
  await supabase
    .from('payment_security_events')
    .insert({
      event_type: `webhook_${violationType}`,
      severity: 'high',
      identifier: securityContext.clientIP,
      identifier_type: 'ip',
      event_data: {
        transaction_id: transactionId,
        violation_data: violationData,
        timestamp: new Date().toISOString()
      },
      risk_score: 70,
      auto_blocked: false
    });
  
  await supabase
    .from('payment_audit_logs')
    .insert({
      transaction_id: transactionId,
      event_type: 'security_violation',
      event_data: {
        violation_type: violationType,
        violation_data: violationData,
        client_ip: securityContext.clientIP,
        timestamp: new Date().toISOString(),
        suspicious_activity: securityContext.suspiciousActivity
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: { 
        [violationType]: true,
        'high_risk': true
      }
    });
}
