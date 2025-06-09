
import React, { useEffect, useState } from "react";
import { fetchPremiumAds } from "@/services/trendingService";
import { convertExpiredPremiumAds } from "@/services/premiumExpirationService";
import { Ad } from "@/types/adTypes";
import PremiumAdGrid from "@/components/premium/PremiumAdGrid";
import EmptyState from "@/components/ads/EmptyState";
import CarouselSkeleton from "@/components/ads/CarouselSkeleton";

const TrendingAdsSection = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPremiumAds = async () => {
      setIsLoading(true);
      setError(false);
      
      try {
        console.log("Loading featured ads for trending section...");
        
        // First, check for expired premium ads and convert them
        await convertExpiredPremiumAds();
        
        // Then load the current premium ads
        const ads = await fetchPremiumAds(8); // Limiter à 8 pour la section trending
        console.log("Featured ads loaded:", ads.length);
        setPremiumAds(ads);
      } catch (err) {
        console.error("Error loading featured ads:", err);
        setError(true);
        setPremiumAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPremiumAds();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Tendances en ce moment</h2>
        <CarouselSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Tendances en ce moment</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Une erreur s'est produite lors du chargement.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-mboa-orange text-white rounded hover:bg-mboa-orange/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (premiumAds.length === 0) {
    return (
      <EmptyState 
        title="Tendances en ce moment"
        message="Aucune annonce mise en avant disponible pour le moment."
        actionLink="/publier"
        actionText="Publier une annonce"
        isPremium={true}
      />
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Tendances en ce moment</h2>
      <PremiumAdGrid ads={premiumAds} />
    </div>
  );
};

export default TrendingAdsSection;
