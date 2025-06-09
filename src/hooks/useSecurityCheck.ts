
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

  const checkSecurity = async (
    actionType: 'login_attempt' | 'password_reset' | 'account_creation',
    userIdentifier?: string,
    additionalData?: Record<string, any>
  ) => {
    const clientIP = getClientIP();
    const currentTime = Date.now();
    
    try {
      // Check form submission timing
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

      // Check IP rate limiting
      const ipRateLimit = await checkAuthRateLimit(await clientIP, 'ip', actionType);
      
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
        
        await logSecurityEvent('ip_rate_limit_exceeded', 'high', {
          action_type: actionType,
          client_ip: clientIP,
          blocked_until: blockedUntil
        });
        
        return { allowed: false, reason: 'ip_rate_limit' };
      }

      // Check user rate limiting if available
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
          
          await logSecurityEvent('user_rate_limit_exceeded', 'high', {
            action_type: actionType,
            user_identifier: userIdentifier,
            blocked_until: blockedUntil
          });
          
          return { allowed: false, reason: 'user_rate_limit' };
        }
      }

      // Analyze suspicious activity
      if (additionalData) {
        const suspiciousActivity = await detectSuspiciousActivity(
          userIdentifier || await clientIP,
          userIdentifier ? 'user' : 'ip',
          {
            action_type: actionType,
            client_ip: await clientIP,
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
            client_ip: await clientIP
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
        client_ip: await clientIP
      });
      
      // In case of error, allow the action but log the error
      return { allowed: true };
    }
  };

  return {
    checkSecurity,
    isBlocked,
    blockEndTime
  };
};
