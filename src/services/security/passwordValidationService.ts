
export interface PasswordValidationResult {
  score: number;
  suggestions: string[];
  isStrong: boolean;
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  let score = 0;
  const suggestions: string[] = [];
  
  // Longueur
  if (password.length >= 8) score += 20;
  else suggestions.push('Utilisez au moins 8 caractères');
  
  if (password.length >= 12) score += 10;
  
  // Caractères minuscules
  if (/[a-z]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des lettres minuscules');
  
  // Caractères majuscules
  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des lettres majuscules');
  
  // Chiffres
  if (/[0-9]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des chiffres');
  
  // Caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
  
  // Pénalités pour les patterns communs
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push('Évitez la répétition de caractères');
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 20;
    suggestions.push('Évitez les séquences communes');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    isStrong: score >= 70
  };
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
