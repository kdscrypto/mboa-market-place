
import { useState, useEffect } from 'react';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      try {
        // Simple mobile detection based on window width
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
      } catch (error) {
        console.error('Mobile detection error:', error);
        setIsMobile(false);
      }
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};
