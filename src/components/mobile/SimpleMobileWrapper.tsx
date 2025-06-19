
import React from 'react';
import { useSimpleMobileDetection } from '@/hooks/useSimpleMobileDetection';

interface SimpleMobileWrapperProps {
  children: React.ReactNode;
}

const SimpleMobileWrapper: React.FC<SimpleMobileWrapperProps> = ({ children }) => {
  console.log("=== SIMPLE MOBILE WRAPPER RENDER START ===");
  
  const { isMobile, deviceType } = useSimpleMobileDetection();

  console.log('SimpleMobileWrapper state:', { 
    isMobile, 
    deviceType,
    childrenType: typeof children,
    hasChildren: !!children 
  });

  // Verify children are valid
  if (!children) {
    console.error("SimpleMobileWrapper: No children provided!");
    return <div className="error-no-children">No content to display</div>;
  }

  // Simple mobile optimizations without complex logic
  React.useEffect(() => {
    console.log("SimpleMobileWrapper useEffect triggered");
    
    try {
      if (isMobile) {
        console.log("Applying mobile optimizations...");
        document.documentElement.style.setProperty('--mobile-optimized', 'true');
        document.documentElement.classList.add('mobile-device');
        document.documentElement.classList.remove('desktop-device');
        console.log('Mobile optimizations applied successfully');
      } else {
        console.log("Applying desktop optimizations...");
        document.documentElement.style.setProperty('--mobile-optimized', 'false');
        document.documentElement.classList.add('desktop-device');
        document.documentElement.classList.remove('mobile-device');
        console.log('Desktop optimizations applied successfully');
      }
      
      // Force repaint
      document.documentElement.style.transform = 'translateZ(0)';
      setTimeout(() => {
        document.documentElement.style.transform = '';
      }, 0);
      
    } catch (error) {
      console.error('CRITICAL ERROR in SimpleMobileWrapper useEffect:', error);
      console.error('Error details:', error.message, error.stack);
    }
  }, [isMobile]);

  const wrapperClasses = `simple-mobile-wrapper ${isMobile ? 'mobile-device' : 'desktop-device'}`;
  console.log("SimpleMobileWrapper classes:", wrapperClasses);

  console.log("=== SIMPLE MOBILE WRAPPER RENDER END ===");

  return (
    <div 
      className={wrapperClasses}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: isMobile ? '#f0f0f0' : '#ffffff',
        border: isMobile ? '3px solid red' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default SimpleMobileWrapper;
