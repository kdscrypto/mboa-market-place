
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedSecurity } from './useEnhancedSecurity';
import { 
  checkAuthRateLimit, 
  detectSuspiciousActivity, 
  getClientIP,
  logSecurityEvent,
  checkFormSubmissionTiming
} from '@/services/securityService';

export const useSecurityCheck = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<Date | null>(null);
  const [formStartTime] = useState(Date.now());
  const { toast } = useToast();
  const { performLoginSecurityCheck, validateAndLogInput } = useEnhancedSecurity();

  const checkSecurity = async (
    actionType: 'login_attempt' | 'password_reset' | 'account_creation',
    userIdentifier?: string,
    additionalData?: Record<string, any>
  ) => {
    const clientIP = await getClientIP();
    
    try {
      // Enhanced security check for login attempts
      if (actionType === 'login_attempt' && userIdentifier) {
        const { allowed, analysis } = await performLoginSecurityCheck(
          userIdentifier,
          !additionalData?.failed,
          additionalData?.error
        );
        
        if (!allowed) {
          setIsBlocked(true);
          if (analysis?.recommended_action === 'block_temporary') {
            setBlockEndTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
          }
          return { allowed: false, reason: 'enhanced_security_block' };
        }
        
        // Continue with additional checks if allowed
      }

      // Form submission timing check
      if (additionalData?.form_submission_time) {
        const timingCheck = checkFormSubmissionTiming(
          formStartTime, 
          additionalData.form_submission_time
        );
        
        if (timingCheck.isSuspicious) {
          await logSecurityEvent('suspicious_form_timing', 'medium', {
            action_type: actionType,
            reason: timingCheck.reason,
            submission_time: additionalData.form_submission_time - formStartTime,
            client_ip: clientIP
          });
        }
      }

      // IP rate limiting
      const ipRateLimit = await checkAuthRateLimit(clientIP, 'ip', actionType);
      
      if (!ipRateLimit.allowed) {
        const blockedUntil = ipRateLimit.blocked_until ? new Date(ipRateLimit.blocked_until) : null;
        setIsBlocked(true);
        setBlockEndTime(blockedUntil);
        
        toast({
          title: "Trop de tentatives",
          description: `Votre adresse IP a été temporairement bloquée. Réessayez ${blockedUntil ? `après ${blockedUntil.toLocaleTimeString()}` : 'plus tard'}.`,
          variant: "destructive",
          duration: 8000
        });
        
        return { allowed: false, reason: 'ip_rate_limit' };
      }

      // User rate limiting if available
      if (userIdentifier) {
        const userRateLimit = await checkAuthRateLimit(userIdentifier, 'user', actionType);
        
        if (!userRateLimit.allowed) {
          const blockedUntil = userRateLimit.blocked_until ? new Date(userRateLimit.blocked_until) : null;
          setIsBlocked(true);
          setBlockEndTime(blockedUntil);
          
          toast({
            title: "Compte temporairement bloqué",
            description: `Trop de tentatives de connexion. Réessayez ${blockedUntil ? `après ${blockedUntil.toLocaleTimeString()}` : 'plus tard'}.`,
            variant: "destructive",
            duration: 8000
          });
          
          return { allowed: false, reason: 'user_rate_limit' };
        }
      }

      // Enhanced suspicious activity analysis
      if (additionalData) {
        const suspiciousActivity = await detectSuspiciousActivity(
          userIdentifier || clientIP,
          userIdentifier ? 'user' : 'ip',
          {
            action_type: actionType,
            client_ip: clientIP,
            timestamp: new Date().toISOString(),
            ...additionalData
          }
        );

        if (suspiciousActivity && suspiciousActivity.risk_score > 60) {
          await logSecurityEvent('high_risk_activity_detected', 'critical', {
            action_type: actionType,
            risk_score: suspiciousActivity.risk_score,
            event_type: suspiciousActivity.event_type,
            user_identifier: userIdentifier,
            client_ip: clientIP
          });
        }
      }

      setIsBlocked(false);
      setBlockEndTime(null);
      return { allowed: true };
    } catch (error) {
      console.error('Security check error:', error);
      await logSecurityEvent('security_check_error', 'medium', {
        action_type: actionType,
        error: error instanceof Error ? error.message : 'Unknown error',
        client_ip: clientIP
      });
      
      return { allowed: true };
    }
  };

  const validateInput = async (
    inputValue: string,
    inputField: string,
    inputType: string = 'general',
    userId?: string
  ) => {
    const { isValid } = await validateAndLogInput(inputValue, inputField, inputType, userId);
    return isValid;
  };

  return {
    checkSecurity,
    validateInput,
    isBlocked,
    blockEndTime
  };
};
