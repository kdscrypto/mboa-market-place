
import { useState, useEffect } from 'react';

export const useSimpleMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Détection initiale côté client uniquement
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // Une seule vérification après le montage, sans événements
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    // Vérification immédiate
    checkMobile();

    // Pas d'événements resize pour éviter les problèmes
    // L'utilisateur peut recharger la page s'il change d'orientation
  }, []);

  return isMobile;
};
