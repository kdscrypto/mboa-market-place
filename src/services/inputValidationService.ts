export interface ValidationResult {
  isValid: boolean;
  score: number;
  suggestions: string[];
  errors?: string[];
  warnings?: string[];
  sanitized?: string;
}

export const validatePasswordStrength = (password: string): ValidationResult & { isStrong: boolean } => {
  let score = 0;
  const suggestions: string[] = [];
  const errors: string[] = [];
  
  // Longueur
  if (password.length >= 8) {
    score += 20;
  } else {
    suggestions.push('Utilisez au moins 8 caractères');
    errors.push('Mot de passe trop court');
  }
  
  if (password.length >= 12) score += 10;
  
  // Caractères minuscules
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('Ajoutez des lettres minuscules');
    errors.push('Manque de lettres minuscules');
  }
  
  // Caractères majuscules
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('Ajoutez des lettres majuscules');
    errors.push('Manque de lettres majuscules');
  }
  
  // Chiffres
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('Ajoutez des chiffres');
    errors.push('Manque de chiffres');
  }
  
  // Caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
    errors.push('Manque de caractères spéciaux');
  }
  
  // Pénalités pour les patterns communs
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push('Évitez la répétition de caractères');
    errors.push('Répétition de caractères détectée');
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 20;
    suggestions.push('Évitez les séquences communes');
    errors.push('Séquence commune détectée');
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  
  return {
    isValid: finalScore >= 60,
    score: finalScore,
    suggestions,
    errors,
    isStrong: finalScore >= 70
  };
};

export const validateEmailAdvanced = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    score: isValid ? 100 : 0,
    suggestions: isValid ? [] : ['Format d\'email invalide']
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  let sanitized = username;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Sanitize username by removing invalid characters
  sanitized = username.replace(/[^a-zA-Z0-9_]/g, '');
  
  // Check length
  if (sanitized.length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }
  if (sanitized.length > 20) {
    errors.push('Le nom d\'utilisateur ne peut pas dépasser 20 caractères');
    sanitized = sanitized.slice(0, 20);
  }
  
  // Check if sanitization was needed
  if (sanitized !== username) {
    warnings.push('Caractères non autorisés supprimés automatiquement');
  }
  
  const isValid = usernameRegex.test(sanitized) && errors.length === 0;
  
  return {
    isValid,
    score: isValid ? 100 : 0,
    suggestions: isValid ? [] : ['Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques'],
    errors,
    warnings,
    sanitized: sanitized !== username ? sanitized : undefined
  };
};

export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^(\+237)?[62][0-9]{8}$/;
  let sanitized = phone;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +237, keep it, otherwise add it if it doesn't start with +
  if (!cleanPhone.startsWith('+237') && !cleanPhone.startsWith('237')) {
    if (cleanPhone.length === 9 && /^[62]/.test(cleanPhone)) {
      cleanPhone = '+237' + cleanPhone;
    }
  } else if (cleanPhone.startsWith('237')) {
    cleanPhone = '+' + cleanPhone;
  }
  
  sanitized = cleanPhone;
  
  // Check if sanitization was needed
  if (sanitized !== phone) {
    warnings.push('Numéro formaté automatiquement');
  }
  
  const isValid = phoneRegex.test(sanitized);
  
  if (!isValid) {
    errors.push('Format de numéro camerounais invalide');
  }
  
  return {
    isValid,
    score: isValid ? 100 : 0,
    suggestions: isValid ? [] : ['Format de numéro camerounais invalide (ex: +237612345678)'],
    errors,
    warnings,
    sanitized: sanitized !== phone ? sanitized : undefined
  };
};
