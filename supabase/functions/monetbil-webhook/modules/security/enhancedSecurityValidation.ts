
export async function performAdvancedSecurityCheck(
  supabase: any,
  transactionId: string,
  userId: string,
  clientIP: string,
  amount: number,
  additionalContext: any = {}
): Promise<{ safe: boolean; riskScore: number; shouldBlock: boolean; anomalies: any }> {
  try {
    const { data: anomalyResult, error } = await supabase
      .rpc('detect_advanced_security_anomalies', {
        p_transaction_id: transactionId,
        p_user_id: userId,
        p_client_ip: clientIP,
        p_amount: amount,
        p_additional_context: additionalContext
      });

    if (error) {
      console.error('Advanced security check failed:', error);
      // Fail secure - if we can't check, assume unsafe
      return { 
        safe: false, 
        riskScore: 100, 
        shouldBlock: true, 
        anomalies: { error: 'security_check_failed' } 
      };
    }

    const riskScore = anomalyResult?.risk_score || 0;
    const shouldBlock = anomalyResult?.auto_block || false;
    const requiresReview = anomalyResult?.requires_review || false;

    return {
      safe: riskScore < 50,
      riskScore,
      shouldBlock,
      anomalies: {
        ...anomalyResult?.anomaly_flags,
        requires_review: requiresReview
      }
    };
  } catch (error) {
    console.error('Advanced security check exception:', error);
    return { 
      safe: false, 
      riskScore: 100, 
      shouldBlock: true, 
      anomalies: { error: 'security_check_exception' } 
    };
  }
}

export async function encryptTransactionData(
  supabase: any,
  transactionId: string,
  paymentData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .rpc('encrypt_payment_data', {
        p_transaction_id: transactionId,
        p_payment_data: paymentData
      });

    if (error) {
      console.error('Data encryption failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Data encryption exception:', error);
    return { success: false, error: 'encryption_exception' };
  }
}

export async function getSecurityMetrics(
  supabase: any,
  timeWindowHours: number = 24
): Promise<any> {
  try {
    const { data: metrics, error } = await supabase
      .rpc('security_performance_metrics', {
        p_time_window_hours: timeWindowHours
      });

    if (error) {
      console.error('Security metrics fetch failed:', error);
      return null;
    }

    return metrics;
  } catch (error) {
    console.error('Security metrics exception:', error);
    return null;
  }
}
