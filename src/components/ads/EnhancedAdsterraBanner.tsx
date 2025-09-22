// Enhanced Adsterra Banner with new lazy loading system
import React from "react";
import LazyAdContainer from "./LazyAdContainer";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import { cn } from "@/lib/utils";

interface EnhancedAdsterraBannerProps {
  zoneKeyOrId: string;
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  format?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  showDebugInfo?: boolean;
  fallbackContent?: React.ReactNode;
}

const EnhancedAdsterraBanner: React.FC<EnhancedAdsterraBannerProps> = ({
  zoneKeyOrId,
  className,
  style = { width: "100%", height: "250px" },
  format = "banner",
  showLoadingState = true,
  showErrorState = true,
  showDebugInfo = false,
  fallbackContent
}) => {
  const { trackImpression, trackClick } = useAdAnalytics(zoneKeyOrId, `enhanced_banner_${format}`);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`📊 Enhanced Adsterra Banner impression tracked for zone: ${zoneKeyOrId}`);
  };

  const handleClickTrack = () => {
    trackClick();
    console.log(`🖱️ Enhanced Adsterra Banner clicked for zone: ${zoneKeyOrId}`);
  };

  return (
    <div 
      className={cn("enhanced-adsterra-banner", className)}
      onClick={handleClickTrack}
      onLoad={handleImpressionTrack}
    >
      <LazyAdContainer
        zoneKeyOrId={zoneKeyOrId}
        adType="banner"
        style={style}
        showLoadingState={showLoadingState}
        showErrorState={showErrorState}
        showDebugInfo={showDebugInfo}
        fallbackContent={fallbackContent}
      />
    </div>
  );
};

export default EnhancedAdsterraBanner;