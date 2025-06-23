
import { useState, useEffect } from 'react';

export const useSimpleMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Détection initiale sécurisée
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    try {
      // Vérification simple sans événements
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        console.log('Détection mobile:', mobile, 'largeur:', window.innerWidth);
      };

      checkMobile();
    } catch (error) {
      console.error('Erreur détection mobile:', error);
      setIsMobile(false);
    }
  }, []);

  return isMobile;
};
