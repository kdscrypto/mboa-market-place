
import { useState, useEffect } from 'react';

interface OrientationState {
  orientation: 'portrait' | 'landscape';
  isChanging: boolean;
  dimensions: { width: number; height: number };
}

export const useOrientationHandler = () => {
  const [orientationState, setOrientationState] = useState<OrientationState>({
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    isChanging: false,
    dimensions: { width: window.innerWidth, height: window.innerHeight }
  });

  useEffect(() => {
    let orientationTimer: NodeJS.Timeout;

    const handleOrientationChange = () => {
      console.log("Orientation change detected");
      
      // Marquer comme en changement
      setOrientationState(prev => ({
        ...prev,
        isChanging: true
      }));

      // Délai pour laisser le temps au navigateur de s'ajuster
      orientationTimer = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const newOrientation = newHeight > newWidth ? 'portrait' : 'landscape';
        
        console.log("Orientation change completed:", {
          orientation: newOrientation,
          dimensions: `${newWidth}x${newHeight}`
        });

        setOrientationState({
          orientation: newOrientation,
          isChanging: false,
          dimensions: { width: newWidth, height: newHeight }
        });
      }, 300); // Délai pour stabiliser l'orientation
    };

    const handleResize = () => {
      // Éviter les re-rendus trop fréquents
      clearTimeout(orientationTimer);
      handleOrientationChange();
    };

    // Écouter les changements d'orientation et de taille
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      if (orientationTimer) {
        clearTimeout(orientationTimer);
      }
    };
  }, []);

  return orientationState;
};
