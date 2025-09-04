import React from "react";
import { useAdsterraBanner } from "@/hooks/useAdsterra";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";
import AdContainer from "./AdContainer";

interface AdsterraBannerProps {
  zoneId: string;
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  format?: 'banner' | 'leaderboard' | 'skyscraper';
}

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  zoneId,
  className,
  style = { width: "100%", height: "250px" },
  format = "banner"
}) => {
  const { adRef } = useAdsterraBanner(zoneId, format);
  const { trackImpression, trackClick } = useAdAnalytics(zoneId, `banner_${format}`);

  const handleImpressionTrack = () => {
    trackImpression();
    console.log(`Adsterra Banner impression tracked for zone: ${zoneId}`);
  };

  const handleAdClick = () => {
    trackClick();
  };

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <div className="adsterra-banner bg-gradient-to-r from-mboa-orange/5 to-mboa-orange/10 border border-mboa-orange/20 rounded-lg p-4">
        <div className="text-xs text-gray-500 mb-2 text-center">Publicité</div>
        <div
          ref={adRef}
          className="adsterra-zone cursor-pointer"
          style={{
            ...style,
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          data-zone={zoneId}
          onClick={handleAdClick}
        />
      </div>
    </AdContainer>
  );
};

export default AdsterraBanner;