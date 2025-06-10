
export interface EmailValidationResult {
  isValid: boolean;
  score: number;
  suggestions: string[];
}

export const validateEmailAdvanced = (email: string): EmailValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  // Liste des domaines interdits (exemple)
  const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (blockedDomains.includes(domain)) {
    return {
      isValid: false,
      score: 0,
      suggestions: ['Ce domaine email n\'est pas autorisé']
    };
  }
  
  return {
    isValid,
    score: isValid ? 100 : 0,
    suggestions: isValid ? [] : ['Format d\'email invalide']
  };
};
