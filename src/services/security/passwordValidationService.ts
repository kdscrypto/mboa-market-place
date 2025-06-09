
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

export interface PasswordComplexityResult {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasMinLength: boolean;
  entropy: number;
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Minimum length
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  // At least one uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else {
    score += 1;
  }

  // At least one lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else {
    score += 1;
  }

  // At least one digit
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5)
  };
};

export const validatePasswordComplexity = (password: string): PasswordComplexityResult => {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasMinLength: password.length >= 8,
    entropy: calculatePasswordEntropy(password)
  };
};

const calculatePasswordEntropy = (password: string): number => {
  const charsets = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /[0-9]/, size: 10 },
    { regex: /[^a-zA-Z0-9]/, size: 32 }
  ];

  let charsetSize = 0;
  charsets.forEach(charset => {
    if (charset.regex.test(password)) {
      charsetSize += charset.size;
    }
  });

  return password.length * Math.log2(charsetSize);
};
