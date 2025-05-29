
export const parseRecoveryUrl = () => {
  const urlHash = window.location.hash;
  const urlParams = new URLSearchParams(urlHash.substring(1));
  const recoveryType = urlParams.get('type');
  const hasAccessToken = urlParams.has('access_token');
  
  return {
    urlHash,
    recoveryType,
    hasAccessToken,
    isValidRecoveryUrl: recoveryType === 'recovery' && hasAccessToken
  };
};

export const getPasswordUpdateErrorMessage = (error: any): string => {
  if (error.message.includes("weak")) {
    return "Le mot de passe est trop faible. Veuillez choisir un mot de passe plus sécurisé.";
  } else if (error.message.includes("same")) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  } else if (error.message.includes("session_not_found") || error.message.includes("invalid_token")) {
    return "Session expirée. Veuillez demander un nouveau lien de réinitialisation.";
  }
  return "Erreur lors de la mise à jour du mot de passe.";
};

export const shouldRedirectToForgotPassword = (error: any): boolean => {
  return error.message.includes("session_not_found") || error.message.includes("invalid_token");
};
