
import { supabase } from "@/integrations/supabase/client";

export interface RateLimitResult {
  allowed: boolean;
  current_count?: number;
  max_requests?: number;
  blocked_until?: string;
  reason?: string;
  window_start?: string;
}

export interface SecurityAnalysis {
  risk_score: number;
  severity: string;
  auto_block: boolean;
  event_type: string;
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
      // En cas d'erreur, permettre la requête mais logger l'erreur
      return { allowed: true };
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return { allowed: true };
  }
};

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

    return data as SecurityAnalysis;
  } catch (error) {
    console.error('Security analysis exception:', error);
    return null;
  }
};

export const getClientIP = (): string => {
  // En production, vous devriez obtenir l'IP réelle du client
  // Pour le développement, nous utilisons une IP factice
  return '127.0.0.1';
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;

  // Longueur minimale
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else {
    score += 1;
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else {
    score += 1;
  }

  // Au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  // Longueur bonus
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5)
  };
};
