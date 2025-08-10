
import React from "react";
import { useGoogleAds } from "@/hooks/useGoogleAds";
import AdContainer from "./AdContainer";

interface GoogleAdSidebarProps {
  adSlot: string;
  className?: string;
  style?: {
    width?: string;
    height?: string;
  };
  adFormat?: string;
  fullWidthResponsive?: boolean;
}

const GoogleAdSidebar: React.FC<GoogleAdSidebarProps> = ({
  adSlot,
  className,
  style = { width: "300px", height: "250px" },
  adFormat = "auto",
  fullWidthResponsive = false
}) => {
  const { adRef } = useGoogleAds(adSlot, adFormat, fullWidthResponsive);

  const handleImpressionTrack = () => {
    console.log(`Google Ad Sidebar impression tracked for slot: ${adSlot}`);
  };

  return (
    <AdContainer
      onImpression={handleImpressionTrack}
      className={className}
    >
      <div className="google-ad-sidebar bg-gradient-to-b from-mboa-orange/5 to-mboa-orange/10 border border-mboa-orange/20 rounded-lg p-4 sticky top-4">
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

export default GoogleAdSidebar;
