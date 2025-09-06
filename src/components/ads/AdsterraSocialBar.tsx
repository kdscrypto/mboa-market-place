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
  const [hasContent, setHasContent] = useState(false);
  const { adRef } = useAdsterraSocialBar(zoneId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check for social bar content
    const checkContent = () => {
      if (adRef.current) {
        const hasAnyContent = adRef.current.children.length > 0 || 
                               adRef.current.innerHTML.trim().length > 0;
        setHasContent(hasAnyContent);
        
        if (hasAnyContent) {
          console.log(`✅ Adsterra Social Bar content loaded for zone: ${zoneId}`);
        }
      }
    };

    const interval = setInterval(checkContent, 2000);
    
    // Stop checking after 20 seconds
    const stopTimer = setTimeout(() => {
      clearInterval(interval);
      if (!hasContent) {
        console.warn(`⚠️ Adsterra Social Bar: No content loaded for zone: ${zoneId}`);
      }
    }, 20000);

    return () => {
      clearTimeout(stopTimer);
      clearInterval(interval);
    };
  }, [zoneId, hasContent]);

  const handleImpressionTrack = () => {
    console.log(`📊 Adsterra Social Bar impression tracked for zone: ${zoneId}`);
  };

  // Only show on mobile
  if (!isMobile) {
    console.log(`📱 Adsterra Social Bar hidden - not on mobile device`);
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
          backgroundColor: hasContent ? 'transparent' : 'rgba(0,0,0,0.9)'
        }}
        data-zone={zoneId}
        onLoad={handleImpressionTrack}
      >
        {/* Fallback content while loading */}
        {!hasContent && (
          <div className="flex items-center justify-center h-full text-white text-xs">
            Chargement...
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsterraSocialBar;