
import React from "react";
import { useGoogleAds } from "@/hooks/useGoogleAds";
import AdContainer from "./AdContainer";

interface GoogleAdBannerProps {
  adSlot: string;
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  adSlot,
  className,
  style = { width: "100%", height: "200px" },
  adFormat = "auto",
  fullWidthResponsive = true
}) => {
  const { adRef } = useGoogleAds(adSlot, adFormat, fullWidthResponsive);

  const handleImpressionTrack = () => {
    console.log(`Google Ad Banner impression tracked for slot: ${adSlot}`);
  };

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <div className="google-ad-banner bg-gradient-to-r from-mboa-orange/5 to-mboa-orange/10 border border-mboa-orange/20 rounded-lg p-4">
        <div className="text-xs text-gray-500 mb-2 text-center">Publicité</div>
        <ins
          ref={adRef}
          className="adsbygoogle block"
          style={{
            display: "block",
            ...style
          }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
        />
      </div>
    </AdContainer>
  );
};

export default GoogleAdBanner;
