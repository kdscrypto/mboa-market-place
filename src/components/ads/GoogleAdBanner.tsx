import React from "react";
import AdsterraBanner from "./AdsterraBanner";

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
  // Convert Google Ad to Adsterra Banner
  return (
    <AdsterraBanner
      zoneId={adSlot} // Use adSlot as zoneId for compatibility
      className={className}
      style={style}
      format="banner"
    />
  );
};

export default GoogleAdBanner;