import React from "react";
import AdsterraSocialBar from "@/components/ads/AdsterraSocialBar";

interface AdsterraSocialBarProviderProps {
  children: React.ReactNode;
  zoneId?: string;
}

const AdsterraSocialBarProvider: React.FC<AdsterraSocialBarProviderProps> = ({
  children,
  zoneId = "mobile-social-bar-1"
}) => {
  return (
    <>
      {children}
      <AdsterraSocialBar zoneId={zoneId} />
    </>
  );
};

export default AdsterraSocialBarProvider;