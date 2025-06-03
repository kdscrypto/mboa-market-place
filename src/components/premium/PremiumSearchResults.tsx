
import React from "react";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import { Search, AlertCircle } from "lucide-react";

interface PremiumSearchResultsProps {
  ads: Ad[];
  isSearching: boolean;
  hasFilters: boolean;
  totalAdsCount: number;
}

const PremiumSearchResults: React.FC<PremiumSearchResultsProps> = ({
  ads,
  isSearching,
  hasFilters,
  totalAdsCount
}) => {
  if (isSearching) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
        <span className="ml-2">Recherche en cours...</span>
      </div>
    );
  }

  if (ads.length === 0 && hasFilters) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="flex justify-center mb-4">
          <Search className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
        <p className="text-gray-600 mb-4">
          Essayez de modifier vos critères de recherche ou supprimez certains filtres.
        </p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucune annonce premium</h3>
        <p className="text-gray-600">
          Aucune annonce premium n'est disponible pour le moment.
        </p>
      </div>
    );
  }

  const resultText = hasFilters 
    ? `${ads.length} résultat${ads.length > 1 ? 's' : ''} trouvé${ads.length > 1 ? 's' : ''}`
    : `${ads.length} annonce${ads.length > 1 ? 's' : ''} premium`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">{resultText}</p>
        {hasFilters && totalAdsCount > ads.length && (
          <p className="text-sm text-gray-500">
            sur {totalAdsCount} annonce{totalAdsCount > 1 ? 's' : ''} au total
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
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
        ))}
      </div>
    </div>
  );
};

export default PremiumSearchResults;
