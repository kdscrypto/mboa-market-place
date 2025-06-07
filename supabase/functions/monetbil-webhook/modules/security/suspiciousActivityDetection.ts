
export interface SecurityContext {
  clientIP: string;
  userAgent: string;
  rateLimitInfo: any;
  suspiciousActivity: any;
  transaction?: any;
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
