
import React from 'react';
import { useOrientationHandler } from '@/hooks/useOrientationHandler';

interface OrientationStabilizerProps {
  children: React.ReactNode;
}

const OrientationStabilizer: React.FC<OrientationStabilizerProps> = ({ children }) => {
  const { isChanging, orientation, dimensions } = useOrientationHandler();

  // Pendant le changement d'orientation, afficher un écran de transition
  if (isChanging) {
    return (
      <div 
        className="fixed inset-0 bg-white z-50 flex items-center justify-center"
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Adaptation à l'orientation...</p>
        </div>
      </div>
    );
  }

  // Wrapper stable pour éviter les erreurs de re-rendu
  return (
    <div 
      className={`w-full min-h-screen ${orientation === 'portrait' ? 'portrait-mode' : 'landscape-mode'}`}
      data-orientation={orientation}
      data-dimensions={`${dimensions.width}x${dimensions.height}`}
    >
      {children}
    </div>
  );
};

export default OrientationStabilizer;
