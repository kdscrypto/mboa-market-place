
import { supabase } from '@/integrations/supabase/client';
import { detectSuspiciousLoginPatterns, logLoginAttempt, getEnhancedClientIP } from './authSecurityService';

export interface SuspiciousActivityResult {
  risk_score: number;
  auto_block: boolean;
  severity: string;
  event_type: string;
}

export const detectSuspiciousActivity = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  eventData: Record<string, any>
): Promise<SuspiciousActivityResult | null> => {
  try {
    // Use enhanced detection for login-related activities
    if (eventData.action_type === 'login_attempt' && identifierType === 'user') {
      const analysis = await detectSuspiciousLoginPatterns(
        identifier,
        eventData.client_ip || await getEnhancedClientIP()
      );
      
      if (analysis) {
        return {
          risk_score: analysis.risk_score,
          auto_block: analysis.recommended_action === 'block_temporary',
          severity: analysis.threat_level,
          event_type: 'enhanced_login_analysis'
        };
      }
    }

    // Fallback to original detection for other activities
    const { data, error } = await supabase.rpc('detect_suspicious_auth_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: eventData
    });

    if (error) {
      console.error('Suspicious activity detection error:', error);
      return null;
    }

    if (data && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const result = data as any;
      return {
        risk_score: Number(result?.risk_score ?? 0),
        auto_block: Boolean(result?.auto_block ?? false),
        severity: String(result?.severity ?? 'low'),
        event_type: String(result?.event_type ?? 'unknown')
      };
    }

    return null;

  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return null;
  }
};
