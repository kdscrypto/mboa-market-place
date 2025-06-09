
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

export const getClientIP = (): string => {
  // In production, you should get the real client IP
  // For development, we use a mock IP
  return '127.0.0.1';
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;

  // Minimum length
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  // At least one uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else {
    score += 1;
  }

  // At least one lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else {
    score += 1;
  }

  // At least one digit
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5)
  };
};

// Enhanced functions for Phase 2
export const validatePasswordComplexity = (password: string): {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasMinLength: boolean;
  entropy: number;
} => {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasMinLength: password.length >= 8,
    entropy: calculatePasswordEntropy(password)
  };
};

const calculatePasswordEntropy = (password: string): number => {
  const charsets = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /[0-9]/, size: 10 },
    { regex: /[^a-zA-Z0-9]/, size: 32 }
  ];

  let charsetSize = 0;
  charsets.forEach(charset => {
    if (charset.regex.test(password)) {
      charsetSize += charset.size;
    }
  });

  return password.length * Math.log2(charsetSize);
};

export const generateSecurityRecommendations = (
  passwordScore: number,
  attemptCount: number
): string[] => {
  const recommendations: string[] = [];

  if (passwordScore < 3) {
    recommendations.push("Utilisez un mot de passe plus complexe avec des majuscules, minuscules, chiffres et caractères spéciaux");
  }

  if (attemptCount > 2) {
    recommendations.push("Trop de tentatives détectées. Assurez-vous de saisir le bon mot de passe");
  }

  recommendations.push("Activez l'authentification à deux facteurs pour une sécurité renforcée");
  recommendations.push("Utilisez un gestionnaire de mots de passe pour créer des mots de passe uniques");

  return recommendations;
};

// Enhanced security monitoring functions
export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
): Promise<void> => {
  try {
    console.log(`Security Event [${severity.toUpperCase()}]: ${eventType}`, details);
    
    // In a real implementation, you would send this to your security monitoring system
    // For now, we just log it
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const checkFormSubmissionTiming = (startTime: number, endTime: number): {
  isSuspicious: boolean;
  reason?: string;
} => {
  const submissionTime = endTime - startTime;
  
  // Too fast (likely bot)
  if (submissionTime < 2000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted too quickly (possible bot)'
    };
  }
  
  // Too slow (possible form hijacking)
  if (submissionTime > 1800000) { // 30 minutes
    return {
      isSuspicious: true,
      reason: 'Form submission took too long (possible session hijacking)'
    };
  }
  
  return { isSuspicious: false };
};
