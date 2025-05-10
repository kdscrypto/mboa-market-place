
import React from "react";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import PremiumBadge from "@/components/PremiumBadge";

interface PremiumAdGridProps {
  ads: Ad[];
  title?: string;
}

const PremiumAdGrid: React.FC<PremiumAdGridProps> = ({ ads, title }) => {
  return (
    <div className="mb-8">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ads.map(ad => (
          <div key={ad.id} className="relative">
            <AdCard
              id={ad.id}
              title={ad.title}
              price={ad.price}
              location={{
                city: ad.city,
                region: ad.region
              }}
              imageUrl={ad.imageUrl}
              createdAt={new Date(ad.created_at)}
            />
            <div className="absolute top-2 right-2">
              <PremiumBadge className="z-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumAdGrid;
