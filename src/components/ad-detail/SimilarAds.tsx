import React from 'react';
import { Ad } from '@/types/adTypes';
import { useSimilarAds } from '@/hooks/useSimilarAds';
import AdCardItem from '@/components/ads/AdCardItem';
import CarouselSkeleton from '@/components/ads/CarouselSkeleton';

interface SimilarAdsProps {
  currentAd: Ad;
}

const SimilarAds: React.FC<SimilarAdsProps> = ({ currentAd }) => {
  const { similarAds, loading, error } = useSimilarAds({
    currentAdId: currentAd.id,
    category: currentAd.category,
    region: currentAd.region,
    limit: 6
  });

  // Ne pas afficher la section si pas d'annonces similaires et pas en cours de chargement
  if (!loading && similarAds.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h2 className="text-xl font-bold theme-text-primary mb-4">
        Annonces similaires
      </h2>
      
      {loading ? (
        <CarouselSkeleton count={6} />
      ) : error ? (
        <div className="text-center py-8">
          <p className="theme-text-secondary text-sm">
            Impossible de charger les annonces similaires
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {similarAds.map((ad) => (
            <AdCardItem key={ad.id} ad={ad} />
          ))}
        </div>
      )}
      
      {!loading && similarAds.length > 0 && (
        <div className="text-center mt-4">
          <p className="theme-text-secondary text-xs">
            {similarAds.length} annonce{similarAds.length > 1 ? 's' : ''} similaire{similarAds.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimilarAds;