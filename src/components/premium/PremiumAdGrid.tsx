
import React from "react";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import PremiumBadge from "@/components/PremiumBadge";
import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface PremiumAdGridProps {
  ads: Ad[];
  title?: string;
}

const PremiumAdGrid: React.FC<PremiumAdGridProps> = ({ ads, title }) => {
  return (
    <div className="mb-8">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ads.map((ad, index) => (
          <React.Fragment key={ad.id}>
            <div className="relative">
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
            {/* Insert native ad every 8 items */}
            {(index + 1) % 8 === 0 && (
              <AdsterraNativeBanner
                className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5"
                title="Sponsorisé"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PremiumAdGrid;
