
import { useState, useEffect } from 'react';

interface SimpleMobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

export const useSimpleMobileDetection = (): SimpleMobileDetection => {
  const [detection, setDetection] = useState<SimpleMobileDetection>({
    isMobile: false,
    isTablet: false,
    deviceType: 'desktop',
    orientation: 'landscape'
  });

  useEffect(() => {
    const updateDetection = () => {
      try {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        
        let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
        if (isMobile) deviceType = 'mobile';
        else if (isTablet) deviceType = 'tablet';
        
        const orientation = height > width ? 'portrait' : 'landscape';
        
        console.log('Simple mobile detection:', { isMobile, isTablet, deviceType, orientation, width, height });
        
        setDetection({
          isMobile,
          isTablet,
          deviceType,
          orientation
        });
      } catch (error) {
        console.error('Error in simple mobile detection:', error);
        // Fallback to safe defaults
        setDetection({
          isMobile: false,
          isTablet: false,
          deviceType: 'desktop',
          orientation: 'landscape'
        });
      }
    };

    updateDetection();
    
    const handleResize = () => {
      try {
        updateDetection();
      } catch (error) {
        console.error('Error in resize handler:', error);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return detection;
};
