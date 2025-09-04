import React from "react";
import AdsterraSocialBar from "@/components/ads/AdsterraSocialBar";

interface AdsterraSocialBarProviderProps {
  children: React.ReactNode;
  zoneId?: string;
}

const AdsterraSocialBarProvider: React.FC<AdsterraSocialBarProviderProps> = ({
  children,
  zoneId = "fe10e69177de8cccddb46f67064b9c9b"
}) => {
  return (
    <>
      {children}
      <AdsterraSocialBar zoneId={zoneId} />
    </>
  );
};

export default AdsterraSocialBarProvider;