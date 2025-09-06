
export interface EmailValidationResult {
  isValid: boolean;
  score: number;
  suggestions: string[];
}

export const validateEmailAdvanced = (email: string): EmailValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  // Liste étendue des domaines email jetables interdits
  const blockedDomains = [
    // Services temporaires courants
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'maildrop.cc', 'temp-mail.org', 'yopmail.com', 'sharklasers.com',
    'throwaway.email', 'mohmal.com', 'emailondeck.com', 'getnada.com',
    // Autres services jetables
    'fakeinbox.com', 'mailcatch.com', 'trashmail.com', 'dispostable.com',
    'temporaryemail.us', 'email-temp.com', 'mintemail.com', 'tempail.com',
    'jetable.org', 'spamgourmet.com', 'mailnesia.com', '20minutemail.it',
    'tempinbox.com', 'temp-mail.io', 'dropmail.me', 'mailbox.in.ua'
  ];
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
