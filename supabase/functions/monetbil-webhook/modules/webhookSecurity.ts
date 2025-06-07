
export interface SecurityContext {
  clientIP: string;
  userAgent: string;
  rateLimitInfo: any;
  suspiciousActivity: any;
  transaction?: any;
}

export async function checkWebhookRateLimit(
  supabase: any,
  clientIP: string
): Promise<{ allowed: boolean; rateLimitInfo: any }> {
  console.log('Checking webhook rate limits for IP:', clientIP);
  
  // More restrictive rate limits for webhook calls
  const { data: ipRateLimit, error: rateLimitError } = await supabase
    .rpc('check_rate_limit', {
      p_identifier: clientIP,
      p_identifier_type: 'ip',
      p_action_type: 'webhook_call',
      p_max_requests: 20, // Reduced from 50 to 20 webhook calls per hour per IP
      p_window_minutes: 60
    });

  if (rateLimitError) {
    console.error('Webhook rate limit check error:', rateLimitError);
    // Fail secure - if we can't check rate limits, block the request
    return { allowed: false, rateLimitInfo: null };
  }

  if (ipRateLimit && !ipRateLimit.allowed) {
    console.log('Webhook rate limit exceeded for IP:', clientIP, ipRateLimit);
    
    // Log security event for excessive webhook calls
    await supabase
      .from('payment_security_events')
      .insert({
        event_type: 'webhook_rate_limit_exceeded',
        severity: 'high', // Increased severity
        identifier: clientIP,
        identifier_type: 'ip',
        event_data: {
          rate_limit_info: ipRateLimit,
          timestamp: new Date().toISOString()
        },
        risk_score: 60 // Increased risk score
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

  // Check for webhook flooding from same IP
  const { data: recentWebhooks } = await supabase
    .from('payment_audit_logs')
    .select('id')
    .eq('event_type', 'webhook_received')
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
    .eq('ip_address', securityContext.clientIP);

  let riskScore = 0;
  let shouldBlock = false;

  // Too many webhooks from same IP in short time
  if (recentWebhooks && recentWebhooks.length > 10) {
    riskScore += 40;
    shouldBlock = true;
  }

  // Missing signature is now a high risk factor
  if (!webhookData.signature) {
    riskScore += 50;
    shouldBlock = true;
  }

  // Check for repeated transaction IDs from different IPs (potential attack)
  if (webhookData.transactionId) {
    const { data: otherIPWebhooks } = await supabase
      .from('payment_audit_logs')
      .select('ip_address')
      .eq('event_type', 'webhook_received')
      .eq('event_data->transaction_id', webhookData.transactionId)
      .neq('ip_address', securityContext.clientIP);

    if (otherIPWebhooks && otherIPWebhooks.length > 0) {
      riskScore += 30;
      shouldBlock = true;
    }
  }

  const { data: suspiciousActivity, error: suspiciousActivityError } = await supabase
    .rpc('detect_suspicious_activity', {
      p_identifier: securityContext.clientIP,
      p_identifier_type: 'ip',
      p_event_data: {
        ...webhookActivityData,
        calculated_risk_score: riskScore
      }
    });

  if (suspiciousActivityError) {
    console.error('Webhook suspicious activity detection error:', suspiciousActivityError);
    // Fail secure - if we can't detect suspicious activity, treat as suspicious
    return { suspicious: true, shouldBlock: true, activityData: null };
  }

  // Combine our calculated risk with the RPC result
  if (suspiciousActivity && (suspiciousActivity.auto_block || shouldBlock)) {
    console.log('Suspicious webhook activity detected, blocking:', suspiciousActivity);
    return { suspicious: true, shouldBlock: true, activityData: suspiciousActivity };
  }

  return { 
    suspicious: riskScore > 20, 
    shouldBlock: shouldBlock || riskScore > 50, 
    activityData: suspiciousActivity 
  };
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
      severity: 'critical', // Increased severity for webhook violations
      identifier: securityContext.clientIP,
      identifier_type: 'ip',
      event_data: {
        transaction_id: transactionId,
        violation_data: violationData,
        timestamp: new Date().toISOString(),
        user_agent: securityContext.userAgent
      },
      risk_score: 80, // High risk score for security violations
      auto_blocked: true
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
        user_agent: securityContext.userAgent,
        timestamp: new Date().toISOString(),
        suspicious_activity: securityContext.suspiciousActivity,
        security_level: 'critical'
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: { 
        [violationType]: true,
        'critical_risk': true,
        'auto_blocked': true
      }
    });
}

export async function validateWebhookOrigin(
  supabase: any,
  clientIP: string,
  userAgent: string
): Promise<{ valid: boolean; reason?: string }> {
  
  // Check if IP is from a suspicious or blocked range
  const { data: blockedIPs } = await supabase
    .from('payment_security_events')
    .select('identifier')
    .eq('identifier_type', 'ip')
    .eq('auto_blocked', true)
    .eq('identifier', clientIP)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

  if (blockedIPs && blockedIPs.length > 0) {
    return { 
      valid: false, 
      reason: 'IP address is temporarily blocked due to suspicious activity' 
    };
  }

  // Validate user agent is not suspicious
  if (!userAgent || userAgent.length < 10 || userAgent.includes('bot') || userAgent.includes('curl')) {
    return { 
      valid: false, 
      reason: 'Suspicious or missing user agent' 
    };
  }

  return { valid: true };
}
