
import React, { useState, useEffect } from 'react';

const MobileDebugIndicator: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    try {
      const updateSize = () => {
        const currentWidth = window.innerWidth;
        const mobile = currentWidth < 768;
        setWidth(currentWidth);
        setIsMobile(mobile);
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    } catch (error) {
      console.error('Error in MobileDebugIndicator:', error);
    }
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="mobile-device-indicator">
      {isMobile ? 'Mobile' : 'Desktop'} - {width}px
    </div>
  );
};

export default MobileDebugIndicator;
