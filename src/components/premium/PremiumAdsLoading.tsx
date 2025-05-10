
import React from "react";
import { Loader2 } from "lucide-react";

const PremiumAdsLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
      <span className="ml-2">Chargement des annonces premium...</span>
    </div>
  );
};

export default PremiumAdsLoading;
