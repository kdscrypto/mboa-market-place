
export interface WebhookAuditData {
  transaction_id: string;
  event_type: string;
  event_data: any;
  ip_address: string;
  user_agent: string;
  security_flags?: any;
}

export async function logWebhookProcessingStart(
  supabase: any,
  transactionId: string,
  webhookData: any,
  lockIdentifier: string,
  securityContext: any
): Promise<void> {
  await supabase
    .from('payment_audit_logs')
    .insert({
      transaction_id: transactionId,
      event_type: 'webhook_processing_start',
      event_data: {
        status: webhookData.status,
        monetbil_transaction_id: webhookData.monetbilTransactionId,
        lock_identifier: lockIdentifier,
        timestamp: new Date().toISOString(),
        security_context: {
          client_ip: securityContext.clientIP,
          user_agent: securityContext.userAgent,
          security_score: securityContext.transaction?.security_score,
          suspicious_activity: securityContext.suspiciousActivity,
          rate_limit_info: securityContext.rateLimitInfo
        }
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: {
        'webhook_processing': true,
        'secure_transaction': (securityContext.transaction?.security_score || 0) >= 80
      }
    });
}

export async function logTransactionExpired(
  supabase: any,
  transactionId: string,
  transaction: any,
  webhookData: any,
  securityContext: any
): Promise<void> {
  const now = new Date();
  
  await supabase
    .from('payment_audit_logs')
    .insert({
      transaction_id: transactionId,
      event_type: 'webhook_expired_transaction',
      event_data: {
        expired_at: now.toISOString(),
        original_expires_at: transaction.expires_at,
        webhook_status: webhookData.status,
        security_context: {
          client_ip: securityContext.clientIP,
          suspicious_activity: securityContext.suspiciousActivity
        }
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: { 'transaction_expired': true }
    });
}

export async function logAdCreationResult(
  supabase: any,
  transactionId: string,
  success: boolean,
  adData: any,
  securityContext: any,
  adId?: string,
  error?: string
): Promise<void> {
  if (success && adId) {
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'ad_created_successfully',
        event_data: {
          ad_id: adId,
          ad_type: adData.adType,
          timestamp: new Date().toISOString(),
          security_context: {
            transaction_security_score: securityContext.transaction?.security_score,
            client_fingerprint: securityContext.transaction?.client_fingerprint,
            verified_payment: true
          }
        },
        ip_address: securityContext.clientIP,
        user_agent: securityContext.userAgent,
        security_flags: { 
          'ad_created': true,
          'secure_payment': true
        }
      });
  } else {
    await supabase
      .from('payment_audit_logs')
      .insert({
        transaction_id: transactionId,
        event_type: 'ad_creation_failed',
        event_data: {
          error: error || 'Unknown error',
          timestamp: new Date().toISOString(),
          security_context: {
            transaction_security_score: securityContext.transaction?.security_score,
            client_fingerprint: securityContext.transaction?.client_fingerprint
          }
        },
        ip_address: securityContext.clientIP,
        user_agent: securityContext.userAgent,
        security_flags: { 'ad_creation_failed': true }
      });
  }
}

export async function logPaymentFailure(
  supabase: any,
  transactionId: string,
  status: string,
  monetbilTransactionId: string,
  securityContext: any
): Promise<void> {
  await supabase
    .from('payment_audit_logs')
    .insert({
      transaction_id: transactionId,
      event_type: 'payment_failed',
      event_data: {
        monetbil_status: status,
        monetbil_transaction_id: monetbilTransactionId,
        timestamp: new Date().toISOString(),
        security_context: {
          client_ip: securityContext.clientIP,
          user_agent: securityContext.userAgent,
          transaction_security_score: securityContext.transaction?.security_score
        }
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: { 'payment_failed': true }
    });
}

export async function logWebhookProcessingComplete(
  supabase: any,
  transactionId: string,
  finalStatus: string,
  securityContext: any
): Promise<void> {
  await supabase
    .from('payment_audit_logs')
    .insert({
      transaction_id: transactionId,
      event_type: 'webhook_processing_complete',
      event_data: {
        final_status: finalStatus,
        timestamp: new Date().toISOString(),
        security_summary: {
          client_ip: securityContext.clientIP,
          transaction_security_score: securityContext.transaction?.security_score,
          signature_verified: !!securityContext.signatureVerified,
          suspicious_activity_risk: securityContext.suspiciousActivity?.risk_score || 0,
          rate_limit_status: securityContext.rateLimitInfo
        }
      },
      ip_address: securityContext.clientIP,
      user_agent: securityContext.userAgent,
      security_flags: { 
        'processing_complete': true,
        'secure_processing': true
      }
    });
}
