
import { useState, useEffect } from 'react';

export const useSimpleMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    } catch (error) {
      console.error('Error in useSimpleMobile:', error);
      setIsMobile(false);
    }
  }, []);

  return isMobile;
};
