
import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { categories } from "@/data/categoriesData";

// Regions data - same as in SearchResults
const regions = [
  { id: 0, name: 'Tout le Cameroun', slug: 'all' },
  { id: 1, name: 'Littoral', slug: 'littoral' },
  { id: 2, name: 'Centre', slug: 'centre' },
  { id: 3, name: 'Ouest', slug: 'ouest' },
  { id: 4, name: 'Sud-Ouest', slug: 'sud-ouest' },
  { id: 5, name: 'Nord-Ouest', slug: 'nord-ouest' },
  { id: 6, name: 'Est', slug: 'est' },
  { id: 7, name: 'Adamaoua', slug: 'adamaoua' },
  { id: 8, name: 'Nord', slug: 'nord' },
  { id: 9, name: 'Extrême-Nord', slug: 'extreme-nord' },
  { id: 10, name: 'Sud', slug: 'sud' },
];

interface SearchResultsHeaderProps {
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalCount,
  isLoading,
  error,
  filters
}) => {
  // Format search summary
  const getSearchSummary = () => {
    const parts = [];
    
    if (filters.query) {
      parts.push(`"${filters.query}"`);
    }
    
    if (filters.category && filters.category !== '0') {
      const categoryId = parseInt(filters.category);
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      if (categoryName && categoryName !== 'Toutes les catégories') {
        parts.push(`dans ${categoryName}`);
      }
    }
    
    if (filters.region && filters.region !== '0') {
      const regionId = parseInt(filters.region);
      const regionName = regions.find(r => r.id === regionId)?.name;
      if (regionName && regionName !== 'Tout le Cameroun') {
        parts.push(`à ${regionName}`);
      }
    }
    
    if (filters.minPrice && filters.maxPrice) {
      parts.push(`entre ${parseInt(filters.minPrice).toLocaleString()} XAF et ${parseInt(filters.maxPrice).toLocaleString()} XAF`);
    } else if (filters.minPrice) {
      parts.push(`à partir de ${parseInt(filters.minPrice).toLocaleString()} XAF`);
    } else if (filters.maxPrice) {
      parts.push(`jusqu'à ${parseInt(filters.maxPrice).toLocaleString()} XAF`);
    }
    
    if (parts.length === 0) {
      return "Toutes les annonces";
    }
    
    return parts.join(' ');
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        Résultats de recherche
      </h1>
      <div className="flex flex-wrap justify-between items-center mt-2">
        <p className="text-gray-600">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 
              Recherche en cours...
            </span>
          ) : (
            <>
              <span className="font-semibold">{totalCount}</span> résultat{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''} pour {getSearchSummary()}
              {filters.query && (
                <div className="text-sm text-gray-500 mt-1">
                  Recherche avancée : correspondance partielle et insensible à la casse
                </div>
              )}
            </>
          )}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
