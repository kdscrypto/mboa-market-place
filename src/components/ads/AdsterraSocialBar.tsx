import React, { useEffect, useState } from "react";
import { useAdsterraSocialBar } from "@/hooks/useAdsterra";

interface AdsterraSocialBarProps {
  zoneId: string;
  className?: string;
}

const AdsterraSocialBar: React.FC<AdsterraSocialBarProps> = ({
  zoneId,
  className
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const { adRef } = useAdsterraSocialBar(zoneId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImpressionTrack = () => {
    console.log(`Adsterra Social Bar impression tracked for zone: ${zoneId}`);
  };

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
      <div
        ref={adRef}
        className="adsterra-socialbar-zone"
        style={{
          height: '50px',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)'
        }}
        data-zone={zoneId}
        onLoad={handleImpressionTrack}
      />
    </div>
  );
};

export default AdsterraSocialBar;