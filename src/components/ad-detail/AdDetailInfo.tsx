
import React from "react";
import { Ad } from "@/types/adTypes";

interface AdDetailInfoProps {
  ad: Ad;
}

const AdDetailInfo: React.FC<AdDetailInfoProps> = ({ ad }) => {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold theme-text-primary">{ad.title}</h1>
        {ad.is_premium && (
          <span className="bg-yellow-400 text-xs text-yellow-800 px-2 py-1 rounded-full">
            Premium
          </span>
        )}
      </div>
      <p className="text-xl font-semibold text-mboa-orange mb-4">
        {ad.price.toLocaleString()} FCFA
      </p>
      <div className="mb-6">
        <p className="theme-text-primary whitespace-pre-line">{ad.description}</p>
      </div>
      <div className="space-y-2 mb-6">
        {/* Display category name instead of ID */}
        <p className="text-sm theme-text-secondary"><span className="font-semibold theme-text-primary">Catégorie:</span> {ad.category}</p>
        <p className="text-sm theme-text-secondary"><span className="font-semibold theme-text-primary">Lieu:</span> {ad.city}, {ad.region}</p>
        <p className="text-sm theme-text-secondary"><span className="font-semibold theme-text-primary">Date de publication:</span> {new Date(ad.created_at).toLocaleDateString()}</p>
      </div>
    </>
  );
};

export default AdDetailInfo;
