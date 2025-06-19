
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileDebugIndicator: React.FC = () => {
  const isMobile = useIsMobile();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="mobile-device-indicator">
      {isMobile ? 'Mobile' : 'Desktop'} - {window.innerWidth}px
    </div>
  );
};

export default MobileDebugIndicator;
