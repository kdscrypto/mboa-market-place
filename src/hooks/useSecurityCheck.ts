
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkAuthRateLimit, detectSuspiciousActivity, getClientIP } from '@/services/securityService';

export const useSecurityCheck = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkSecurity = async (
    actionType: 'login_attempt' | 'password_reset' | 'account_creation',
    userIdentifier?: string,
    additionalData?: Record<string, any>
  ) => {
    const clientIP = getClientIP();
    
    try {
      // Vérifier la limitation par IP
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

      // Vérifier la limitation par utilisateur si disponible
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

      // Analyser l'activité suspecte
      if (additionalData) {
        await detectSuspiciousActivity(
          userIdentifier || clientIP,
          userIdentifier ? 'user' : 'ip',
          {
            action_type: actionType,
            client_ip: clientIP,
            timestamp: new Date().toISOString(),
            ...additionalData
          }
        );
      }

      setIsBlocked(false);
      setBlockEndTime(null);
      return { allowed: true };
    } catch (error) {
      console.error('Security check error:', error);
      // En cas d'erreur, permettre l'action mais logger l'erreur
      return { allowed: true };
    }
  };

  return {
    checkSecurity,
    isBlocked,
    blockEndTime
  };
};
