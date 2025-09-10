/**
 * Utilitaire pour vérifier la configuration de la transition de domaine
 */

export const getCurrentDomain = (): string => {
  return window.location.origin;
};

export const isCustomDomain = (): boolean => {
  return window.location.hostname === 'mboamarket.shop';
};

export const isLovableDomain = (): boolean => {
  return window.location.hostname.includes('lovable.app');
};

export const getDomainStatus = () => {
  const domain = getCurrentDomain();
  const isCustom = isCustomDomain();
  const isLovable = isLovableDomain();
  
  return {
    currentDomain: domain,
    isCustomDomain: isCustom,
    isLovableDomain: isLovable,
    transitionStatus: isCustom ? 'completed' : isLovable ? 'pending' : 'unknown'
  };
};

/**
 * Vérifie si la configuration d'authentification est cohérente avec le domaine actuel
 */
export const checkAuthConfiguration = async () => {
  try {
    const status = getDomainStatus();
    
    console.log('📊 Domain Status:', status);
    
    if (status.isCustomDomain) {
      console.log('✅ Domaine personnalisé détecté: mboamarket.shop');
      console.log('📧 Les emails d\'authentification utiliseront ce domaine');
    } else if (status.isLovableDomain) {
      console.log('⏳ Domaine Lovable actuel, transition en attente');
    }
    
    return status;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de configuration:', error);
    return null;
  }
};

/**
 * Utilitaire pour tester la redirection d'authentification
 */
export const getAuthRedirectUrl = (path: string = '/'): string => {
  return `${getCurrentDomain()}${path}`;
};

/**
 * Log des informations de domaine pour debugging
 */
export const logDomainInfo = () => {
  const status = getDomainStatus();
  
  console.group('🌐 Domain Transition Info');
  console.log('Current domain:', status.currentDomain);
  console.log('Is custom domain:', status.isCustomDomain);
  console.log('Is Lovable domain:', status.isLovableDomain);
  console.log('Transition status:', status.transitionStatus);
  console.log('Auth redirect base:', getAuthRedirectUrl());
  console.groupEnd();
  
  return status;
};