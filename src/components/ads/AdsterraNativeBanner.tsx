import React from "react";
import { useAdsterraNative } from "@/hooks/useAdsterra";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import AdContainer from "./AdContainer";
import { cn } from "@/lib/utils";

interface AdsterraNativeBannerProps {
  zoneId: string;
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({
  zoneId,
  className,
  title = "Sponsorisé"
}) => {
  const { adRef } = useAdsterraNative(zoneId);
  const { trackImpression, trackClick } = useAdAnalytics(zoneId, `native_${title}`);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`Adsterra Native Banner impression tracked for zone: ${zoneId}`);
  };

  const handleAdClick = () => {
    trackClick();
  };

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <div className={cn(
        "adsterra-native-banner bg-gradient-to-br from-mboa-orange/10 to-mboa-orange/5",
        "border border-mboa-orange/20 rounded-lg p-4 transition-all duration-300",
        "hover:shadow-lg hover:border-mboa-orange/30",
        className
      )}>
        <div className="text-xs text-gray-500 mb-3 font-medium">{title}</div>
        <div
          ref={adRef}
          className="adsterra-native-zone cursor-pointer"
          style={{
            minHeight: '200px',
            width: '100%'
          }}
          data-zone={zoneId}
          onClick={handleAdClick}
        />
      </div>
    </AdContainer>
  );
};

export default AdsterraNativeBanner;