
import React from "react";
import PremiumBadge from "@/components/PremiumBadge";

const PremiumAdsHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl font-bold">Annonces Premium</h1>
        <PremiumBadge />
      </div>
      <p className="text-gray-600">
        Découvrez toutes nos annonces premium mises en avant
      </p>
    </div>
  );
};

export default PremiumAdsHeader;
