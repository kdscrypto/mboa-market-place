
import React from 'react';
import { useSimpleMobileDetection } from '@/hooks/useSimpleMobileDetection';

interface SimpleMobileWrapperProps {
  children: React.ReactNode;
}

const SimpleMobileWrapper: React.FC<SimpleMobileWrapperProps> = ({ children }) => {
  const { isMobile, deviceType } = useSimpleMobileDetection();

  console.log('SimpleMobileWrapper rendering:', { isMobile, deviceType });

  // Simple mobile optimizations without complex logic
  React.useEffect(() => {
    try {
      if (isMobile) {
        document.documentElement.style.setProperty('--mobile-optimized', 'true');
        console.log('Mobile optimizations applied');
      } else {
        document.documentElement.style.setProperty('--mobile-optimized', 'false');
        console.log('Desktop mode active');
      }
    } catch (error) {
      console.error('Error applying mobile optimizations:', error);
    }
  }, [isMobile]);

  return (
    <div className={`simple-mobile-wrapper ${isMobile ? 'mobile-device' : 'desktop-device'}`}>
      {children}
    </div>
  );
};

export default SimpleMobileWrapper;
