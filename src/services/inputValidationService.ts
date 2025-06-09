
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: string;
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 255); // Limit length
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const sanitized = sanitizeInput(username);
  
  // Length validation
  if (sanitized.length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }
  
  if (sanitized.length > 30) {
    errors.push('Le nom d\'utilisateur ne peut pas dépasser 30 caractères');
  }
  
  // Character validation
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -');
  }
  
  // Reserved words
  const reservedWords = ['admin', 'root', 'user', 'system', 'api', 'www', 'mail'];
  if (reservedWords.includes(sanitized.toLowerCase())) {
    errors.push('Ce nom d\'utilisateur n\'est pas disponible');
  }
  
  // Consecutive special characters
  if (/[-_]{2,}/.test(sanitized)) {
    warnings.push('Évitez les caractères spéciaux consécutifs');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  let sanitized = phone.replace(/\s+/g, '').replace(/[-()]/g, '');
  
  // Cameroon phone validation
  const cameroonPattern = /^(\+237|237)?[67][0-9]{8}$/;
  
  if (!cameroonPattern.test(sanitized)) {
    errors.push('Format de numéro camerounais invalide (6XXXXXXXX ou 7XXXXXXXX)');
  }
  
  // Normalize format
  if (sanitized.startsWith('237')) {
    sanitized = '+' + sanitized;
  } else if (sanitized.startsWith('6') || sanitized.startsWith('7')) {
    sanitized = '+237' + sanitized;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized
  };
};
