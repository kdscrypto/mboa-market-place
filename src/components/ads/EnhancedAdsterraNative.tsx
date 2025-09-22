// Enhanced Adsterra Native with new lazy loading system
import React from "react";
import LazyAdContainer from "./LazyAdContainer";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import { cn } from "@/lib/utils";

interface EnhancedAdsterraNativeProps {
  zoneKeyOrId: string;
  className?: string;
  title?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  showDebugInfo?: boolean;
  fallbackContent?: React.ReactNode;
}

const EnhancedAdsterraNative: React.FC<EnhancedAdsterraNativeProps> = ({
  zoneKeyOrId,
  className,
  title = "Sponsorisé",
  showLoadingState = true,
  showErrorState = true,
  showDebugInfo = false,
  fallbackContent
}) => {
  const { trackImpression, trackClick } = useAdAnalytics(zoneKeyOrId, `enhanced_native_${title}`);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`📊 Enhanced Adsterra Native impression tracked for zone: ${zoneKeyOrId}`);
  };

  const handleClickTrack = () => {
    trackClick();
    console.log(`🖱️ Enhanced Adsterra Native clicked for zone: ${zoneKeyOrId}`);
  };

  return (
    <div className={cn("enhanced-adsterra-native space-y-2", className)}>
      {title && (
        <div className="text-xs text-muted-foreground text-center font-medium">
          {title}
        </div>
      )}
      
      <div 
        onClick={handleClickTrack}
        onLoad={handleImpressionTrack}
      >
        <LazyAdContainer
          zoneKeyOrId={zoneKeyOrId}
          adType="native"
          showLoadingState={showLoadingState}
          showErrorState={showErrorState}
          showDebugInfo={showDebugInfo}
          fallbackContent={fallbackContent}
          className="rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
};

export default EnhancedAdsterraNative;