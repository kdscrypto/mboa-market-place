import { supabase } from '@/integrations/supabase/client';
import {
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  validateInputSecurity,
  logInputValidation,
  getEnhancedClientIP,
  generateEnhancedDeviceFingerprint,
  hashInputValue,
  type LoginAttemptData,
  type SuspiciousLoginAnalysis,
  type InputValidationResult
} from './security/authSecurityService';

// Re-export enhanced security functions for backward compatibility
export {
  logLoginAttempt,
  detectSuspiciousLoginPatterns,
  validateInputSecurity,
  logInputValidation,
  getEnhancedClientIP as getClientIP,
  generateEnhancedDeviceFingerprint as generateDeviceFingerprint,
  hashInputValue
};

// Enhanced existing functions with new security features
export const checkAuthRateLimit = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  actionType: string,
  maxRequests: number = 5,
  windowMinutes: number = 15
): Promise<{ allowed: boolean; blocked_until?: string; reason?: string; current_count?: number; max_requests?: number }> => {
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

// Enhanced suspicious activity detection
export const detectSuspiciousActivity = async (
  identifier: string,
  identifierType: 'user' | 'ip',
  eventData: Record<string, any>
): Promise<{ risk_score: number; auto_block: boolean; severity: string; event_type: string } | null> => {
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

// Enhanced security event logging
export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  eventData: Record<string, any>,
  identifier?: string,
  identifierType?: 'user' | 'ip' | 'device'
): Promise<void> => {
  try {
    const clientIP = identifier && identifierType === 'ip' ? identifier : await getEnhancedClientIP();
    const deviceFingerprint = generateEnhancedDeviceFingerprint();
    
    // Enhanced event data
    const enhancedEventData = {
      ...eventData,
      client_ip: clientIP,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      device_fingerprint: deviceFingerprint,
      security_version: '2.0'
    };

    await supabase
      .from('auth_security_events')
      .insert({
        event_type: eventType,
        severity,
        identifier: identifier || clientIP,
        identifier_type: identifierType || 'ip',
        event_data: enhancedEventData,
        risk_score: severity === 'critical' ? 100 : severity === 'high' ? 75 : severity === 'medium' ? 50 : 25,
        auto_blocked: severity === 'critical'
      });

  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

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
    await supabase.rpc('cleanup_security_logs');
  } catch (error) {
    console.error('Error cleaning up security events:', error);
  }
};
