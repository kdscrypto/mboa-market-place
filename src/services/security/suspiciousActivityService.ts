
import { supabase } from "@/integrations/supabase/client";

export interface SecurityAnalysis {
  risk_score: number;
  severity: string;
  auto_block: boolean;
  event_type: string;
}

export const detectSuspiciousActivity = async (
  identifier: string,
  identifierType: 'ip' | 'user' | 'email',
  eventData: Record<string, any>
): Promise<SecurityAnalysis | null> => {
  try {
    const { data, error } = await supabase.rpc('detect_suspicious_auth_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: eventData
    });

    if (error) {
      console.error('Security analysis error:', error);
      return null;
    }

    if (data && typeof data === 'object') {
      const result = data as any;
      return {
        risk_score: Number(result.risk_score) || 0,
        severity: String(result.severity) || 'low',
        auto_block: Boolean(result.auto_block),
        event_type: String(result.event_type) || 'unknown'
      };
    }

    return null;
  } catch (error) {
    console.error('Security analysis exception:', error);
    return null;
  }
};
