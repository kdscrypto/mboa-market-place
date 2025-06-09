
export const logSecurityEvent = async (
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  data: Record<string, any>
): Promise<void> => {
  try {
    const event = {
      event_type: eventType,
      severity,
      event_data: data,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      client_ip: await getClientIP()
    };

    console.log('Security Event:', event);
    
    // In a real implementation, this would send to your logging service
    // For now, we'll just log to console
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const checkFormSubmissionTiming = (
  startTime: number,
  submissionTime: number
): { isSuspicious: boolean; reason?: string } => {
  const timeTaken = submissionTime - startTime;
  
  // Too fast (likely bot)
  if (timeTaken < 2000) {
    return {
      isSuspicious: true,
      reason: 'Form submitted too quickly (possible bot)'
    };
  }
  
  // Too slow (might indicate automation or unusual behavior)
  if (timeTaken > 30 * 60 * 1000) { // 30 minutes
    return {
      isSuspicious: true,
      reason: 'Form submission took unusually long'
    };
  }
  
  return { isSuspicious: false };
};

export const getClientIP = async (): Promise<string> => {
  try {
    // In a real implementation, this would get the actual client IP
    // For demo purposes, we'll return a placeholder
    return 'client-ip-placeholder';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
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
