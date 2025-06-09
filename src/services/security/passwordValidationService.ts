
export interface PasswordValidationResult {
  score: number;
  errors: string[];
  suggestions: string[];
  isValid: boolean;
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
}

export interface PasswordComplexityResult {
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasMinLength: boolean;
  isNotCommon: boolean;
}

const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
];

export const validatePasswordComplexity = (password: string): PasswordComplexityResult => {
  return {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasMinLength: password.length >= 8,
    isNotCommon: !commonPasswords.includes(password.toLowerCase())
  };
};

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const complexity = validatePasswordComplexity(password);
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check length
  if (!complexity.hasMinLength) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
    suggestions.push('Ajoutez plus de caractères à votre mot de passe');
  } else {
    score += 20;
  }

  // Check lowercase
  if (!complexity.hasLowerCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    suggestions.push('Ajoutez des lettres minuscules (a-z)');
  } else {
    score += 15;
  }

  // Check uppercase
  if (!complexity.hasUpperCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    suggestions.push('Ajoutez des lettres majuscules (A-Z)');
  } else {
    score += 15;
  }

  // Check numbers
  if (!complexity.hasNumbers) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
    suggestions.push('Ajoutez des chiffres (0-9)');
  } else {
    score += 15;
  }

  // Check special characters
  if (!complexity.hasSpecialChars) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
  } else {
    score += 20;
  }

  // Check if not common
  if (!complexity.isNotCommon) {
    errors.push('Ce mot de passe est trop commun');
    suggestions.push('Choisissez un mot de passe plus unique');
    score = Math.max(0, score - 25);
  } else {
    score += 15;
  }

  // Additional length bonus
  if (password.length >= 12) {
    score += 10;
  }

  // Determine strength
  let strength: PasswordValidationResult['strength'] = 'very-weak';
  if (score >= 90) strength = 'strong';
  else if (score >= 70) strength = 'good';
  else if (score >= 50) strength = 'fair';
  else if (score >= 30) strength = 'weak';

  return {
    score: Math.min(100, score),
    errors,
    suggestions,
    isValid: errors.length === 0,
    strength
  };
};
