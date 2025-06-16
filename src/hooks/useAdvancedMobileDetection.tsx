
import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  touchSupport: boolean;
  connectionType: string;
  performanceLevel: 'low' | 'medium' | 'high';
}

export const useAdvancedMobileDetection = (): MobileDetectionResult => {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: 'desktop',
    orientation: 'landscape',
    screenSize: { width: 1920, height: 1080 },
    touchSupport: false,
    connectionType: 'unknown',
    performanceLevel: 'high'
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device type detection
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      // Orientation detection
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Touch support detection
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Connection type detection
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';
      
      // Performance level estimation
      let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      
      if (hardwareConcurrency >= 8 && memory >= 8) {
        performanceLevel = 'high';
      } else if (hardwareConcurrency <= 2 || memory <= 2) {
        performanceLevel = 'low';
      }
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        orientation,
        screenSize: { width, height },
        touchSupport,
        connectionType,
        performanceLevel
      });
    };

    updateDetection();
    
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);
    
    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
};
