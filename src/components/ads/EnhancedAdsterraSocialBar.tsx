// Enhanced Adsterra Social Bar with new lazy loading system
import React, { useEffect, useState } from "react";
import LazyAdContainer from "./LazyAdContainer";
import { cn } from "@/lib/utils";

interface EnhancedAdsterraSocialBarProps {
  zoneKeyOrId: string;
  className?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  showDebugInfo?: boolean;
}

const EnhancedAdsterraSocialBar: React.FC<EnhancedAdsterraSocialBarProps> = ({
  zoneKeyOrId,
  className,
  showLoadingState = false, // Usually hidden for social bars
  showErrorState = true,
  showDebugInfo = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  const handleImpressionTrack = () => {
    console.log(`📊 Enhanced Adsterra Social Bar impression tracked for zone: ${zoneKeyOrId}`);
  };

  return (
    <div 
      className={cn(
        "enhanced-adsterra-social-bar fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-sm border-t shadow-lg",
        className
      )}
      onLoad={handleImpressionTrack}
    >
      <LazyAdContainer
        zoneKeyOrId={zoneKeyOrId}
        adType="social"
        showLoadingState={showLoadingState}
        showErrorState={showErrorState}
        showDebugInfo={showDebugInfo}
        className="p-2"
        fallbackContent={
          <div className="text-center py-2 text-xs text-muted-foreground">
            Publicité sociale en cours de chargement...
          </div>
        }
      />
    </div>
  );
};

export default EnhancedAdsterraSocialBar;