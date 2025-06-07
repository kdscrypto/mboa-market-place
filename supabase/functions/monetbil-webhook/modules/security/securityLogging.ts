
import { SecurityContext } from "./suspiciousActivityDetection.ts";

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
