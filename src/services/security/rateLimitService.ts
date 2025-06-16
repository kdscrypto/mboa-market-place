
import { supabase } from '@/integrations/supabase/client';
import { logLoginAttempt, getEnhancedClientIP } from './authSecurityService';

export interface RateLimitResult {
  allowed: boolean;
  blocked_until?: string;
  reason?: string;
  current_count?: number;
  max_requests?: number;
}

export const checkAuthRateLimit = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  actionType: string,
  maxRequests: number = 5,
  windowMinutes: number = 15
): Promise<RateLimitResult> => {
  try {
    const { data, error } = await supabase.rpc('check_auth_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action_type: actionType,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true };
    }

    // Safely handle the RPC response with proper type checking
    if (data && typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const result = data as any;
      const isAllowed = Boolean(result.allowed ?? true);
      
      // Log suspicious activity if rate limit is hit
      if (!isAllowed) {
        await logLoginAttempt({
          email: identifier,
          success: false,
          failureReason: 'rate_limit_exceeded',
          ipAddress: identifierType === 'ip' ? identifier : await getEnhancedClientIP()
        });
      }

      return {
        allowed: isAllowed,
        blocked_until: result.blocked_until ? String(result.blocked_until) : undefined,
        reason: result.reason ? String(result.reason) : undefined,
        current_count: result.current_count ? Number(result.current_count) : undefined,
        max_requests: result.max_requests ? Number(result.max_requests) : undefined
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true };
  }
};
