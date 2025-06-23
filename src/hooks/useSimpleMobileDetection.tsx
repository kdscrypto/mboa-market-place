
import { useState, useEffect } from 'react';

export const useSimpleMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Détection initiale simple et fiable
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // Une seule vérification initiale, pas d'événements
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    console.log('Mobile detection:', mobile, 'viewport:', window.innerWidth);
  }, []);

  return isMobile;
};
