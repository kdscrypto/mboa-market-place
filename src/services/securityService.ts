
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

    // Assurer que les données correspondent au type attendu
    if (data && typeof data === 'object' && 'allowed' in data) {
      return data as RateLimitResult;
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

    // Assurer que les données correspondent au type attendu
    if (data && typeof data === 'object' && 'risk_score' in data) {
      return data as SecurityAnalysis;
    }

    return null;
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

// Nouvelles fonctions pour la phase 2
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
