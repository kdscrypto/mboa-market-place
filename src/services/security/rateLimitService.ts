
import { supabase } from "@/integrations/supabase/client";

export interface RateLimitResult {
  allowed: boolean;
  current_count?: number;
  max_requests?: number;
  blocked_until?: string;
  reason?: string;
  window_start?: string;
}

export const checkAuthRateLimit = async (
  identifier: string,
  identifierType: 'ip' | 'user',
  actionType: 'login_attempt' | 'password_reset' | 'account_creation'
): Promise<RateLimitResult> => {
  try {
    const { data, error } = await supabase.rpc('check_auth_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
      p_max_requests: 5,
      p_window_minutes: 15
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true };
    }

    if (data && typeof data === 'object') {
      const result = data as any;
      return {
        allowed: Boolean(result.allowed),
        current_count: result.current_count ? Number(result.current_count) : undefined,
        max_requests: result.max_requests ? Number(result.max_requests) : undefined,
        blocked_until: result.blocked_until ? String(result.blocked_until) : undefined,
        reason: result.reason ? String(result.reason) : undefined,
        window_start: result.window_start ? String(result.window_start) : undefined
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return { allowed: true };
  }
};
