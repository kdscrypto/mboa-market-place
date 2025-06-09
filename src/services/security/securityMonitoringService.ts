
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

export const getClientIP = (): string => {
  // In production, you should get the real client IP
  // For development, we use a mock IP
  return '127.0.0.1';
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
