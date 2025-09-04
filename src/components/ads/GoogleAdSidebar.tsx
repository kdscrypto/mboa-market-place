
import React from "react";
import AdsterraBanner from "./AdsterraBanner";

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
  // Convert Google Ad to Adsterra Banner with sticky positioning
  return (
    <div className="sticky top-4">
      <AdsterraBanner
        zoneId={adSlot} // Use adSlot as zoneId for compatibility
        className={className}
        style={style}
        format="banner"
      />
    </div>
  );
};

export default GoogleAdSidebar;
