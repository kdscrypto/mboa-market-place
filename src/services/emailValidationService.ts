
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export const validateEmailAdvanced = (email: string): EmailValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Format d\'email invalide');
    return { isValid: false, errors, riskLevel: 'high' };
  }

  // Disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
    'mailinator.com', 'yopmail.com', 'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    errors.push('Les adresses email temporaires ne sont pas autorisées');
    riskLevel = 'high';
  }

  // Common typos in popular domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const typoSuggestions: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  if (typoSuggestions[domain]) {
    suggestions.push(`Vouliez-vous dire ${email.replace(domain, typoSuggestions[domain])} ?`);
    riskLevel = 'medium';
  }

  // Check for suspicious patterns
  if (email.includes('..') || email.includes('++')) {
    errors.push('Format d\'email suspect détecté');
    riskLevel = 'high';
  }

  // Check for too many numbers (potential spam)
  const numberCount = (email.match(/\d/g) || []).length;
  if (numberCount > 8) {
    riskLevel = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    riskLevel
  };
};

export const checkEmailEnumeration = async (email: string): Promise<{
  exists: boolean;
  message: string;
}> => {
  // In a real implementation, you would check against your user database
  // For now, we'll return a generic response to prevent enumeration
  return {
    exists: false,
    message: 'Si cette adresse email existe, un lien de vérification a été envoyé.'
  };
};
