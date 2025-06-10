
import { supabase } from '@/integrations/supabase/client';

// Helper function to safely parse JSON response from RPC calls
const parseRpcResponse = <T>(data: any, defaultValue: T): T => {
  if (!data || typeof data !== 'object') {
    return defaultValue;
  }
  return data as T;
};

// Obtenir l'adresse IP du client
export const getClientIP = async (): Promise<string> => {
  try {
    // En production, utiliser un service pour obtenir l'IP réelle
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '127.0.0.1';
  } catch (error) {
    console.error('Error getting client IP:', error);
    return '127.0.0.1';
  }
};

// Vérifier les limites de taux pour l'authentification
export const checkAuthRateLimit = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  actionType: string,
  maxRequests: number = 5,
  windowMinutes: number = 15
): Promise<{ allowed: boolean; blocked_until?: string; reason?: string }> => {
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
      return { allowed: true }; // En cas d'erreur, permettre l'action
    }

    const result = parseRpcResponse(data, { allowed: true });
    
    return {
      allowed: Boolean(result.allowed ?? true),
      blocked_until: result.blocked_until ? String(result.blocked_until) : undefined,
      reason: result.reason ? String(result.reason) : undefined
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true };
  }
};

// Détecter une activité suspecte
export const detectSuspiciousActivity = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  eventData: Record<string, any>
): Promise<{ risk_score: number; auto_block: boolean; severity: string; event_type: string } | null> => {
  try {
    const { data, error } = await supabase.rpc('detect_suspicious_auth_activity', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_event_data: eventData
    });

    if (error) {
      console.error('Suspicious activity detection error:', error);
      return null;
    }

    const result = parseRpcResponse(data, { 
      risk_score: 0, 
      auto_block: false, 
      severity: 'low', 
      event_type: 'unknown' 
    });

    return {
      risk_score: Number(result.risk_score ?? 0),
      auto_block: Boolean(result.auto_block ?? false),
      severity: String(result.severity ?? 'low'),
      event_type: String(result.event_type ?? 'unknown')
    };

  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return null;
  }
};

// Enregistrer un événement de sécurité
export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  eventData: Record<string, any>,
  identifier?: string,
  identifierType?: 'user' | 'ip' | 'device'
): Promise<void> => {
  try {
    const clientIP = identifier && identifierType === 'ip' ? identifier : await getClientIP();
    
    await supabase
      .from('auth_security_events')
      .insert({
        event_type: eventType,
        severity,
        identifier: identifier || clientIP,
        identifier_type: identifierType || 'ip',
        event_data: {
          ...eventData,
          client_ip: clientIP,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        },
        risk_score: severity === 'critical' ? 100 : severity === 'high' ? 75 : severity === 'medium' ? 50 : 25,
        auto_blocked: severity === 'critical'
      });

  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

// Vérifier le timing de soumission de formulaire (protection contre les bots)
export const checkFormSubmissionTiming = (
  formStartTime: number,
  submissionTime: number
): { isSuspicious: boolean; reason?: string } => {
  const submissionDuration = submissionTime - formStartTime;
  
  // Soumission trop rapide (moins de 2 secondes)
  if (submissionDuration < 2000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted too quickly (possible bot)'
    };
  }
  
  // Soumission trop lente (plus de 30 minutes)
  if (submissionDuration > 30 * 60 * 1000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted after extended period (possible session hijacking)'
    };
  }
  
  return { isSuspicious: false };
};

export const validatePasswordStrength = (password: string): {
  score: number;
  suggestions: string[];
  isStrong: boolean;
} => {
  let score = 0;
  const suggestions: string[] = [];
  
  // Longueur
  if (password.length >= 8) score += 20;
  else suggestions.push('Utilisez au moins 8 caractères');
  
  if (password.length >= 12) score += 10;
  
  // Caractères minuscules
  if (/[a-z]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des lettres minuscules');
  
  // Caractères majuscules
  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des lettres majuscules');
  
  // Chiffres
  if (/[0-9]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des chiffres');
  
  // Caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
  
  // Pénalités pour les patterns communs
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push('Évitez la répétition de caractères');
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 20;
    suggestions.push('Évitez les séquences communes');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    isStrong: score >= 70
  };
};

export const generateSecurityRecommendations = (
  passwordScore: number,
  attemptCount: number
): string[] => {
  const recommendations: string[] = [];
  
  if (passwordScore < 50) {
    recommendations.push('Utilisez un mot de passe plus complexe avec des majuscules, minuscules, chiffres et caractères spéciaux');
  }
  
  if (attemptCount > 3) {
    recommendations.push('Trop de tentatives de connexion. Vérifiez vos identifiants ou réinitialisez votre mot de passe');
  }
  
  if (passwordScore < 30) {
    recommendations.push('Évitez les mots de passe communs comme "password" ou "123456"');
  }
  
  recommendations.push('Activez l\'authentification à deux facteurs pour plus de sécurité');
  recommendations.push('Utilisez un gestionnaire de mots de passe pour générer des mots de passe sécurisés');
  
  return recommendations;
};

export const cleanupSecurityEvents = async (): Promise<void> => {
  try {
    // Supprimer les événements de plus de 90 jours
    await supabase
      .from('auth_security_events')
      .delete()
      .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Supprimer les limites de taux expirées
    await supabase
      .from('auth_rate_limits')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  } catch (error) {
    console.error('Error cleaning up security events:', error);
  }
};

export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};
