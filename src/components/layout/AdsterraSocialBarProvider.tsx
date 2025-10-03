import React from "react";
import AdsterraSocialBar from "@/components/ads/AdsterraSocialBar";

interface AdsterraSocialBarProviderProps {
  children: React.ReactNode;
}

const AdsterraSocialBarProvider: React.FC<AdsterraSocialBarProviderProps> = ({
  children
}) => {
  return (
    <>
      {children}
      <AdsterraSocialBar />
    </>
  );
};

export default AdsterraSocialBarProvider;