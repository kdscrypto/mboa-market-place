
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdCard from "@/components/AdCard";
import SearchFilters from "@/components/SearchFilters";
import { searchAds } from "@/services/searchService";
import { Ad } from "@/types/adTypes";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Ad[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Extract filters from URL search params
  const getFiltersFromUrl = () => {
    const params: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return {
      query: params.query || '',
      category: params.category || '0',
      region: params.region || '0',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
    };
  };

  const currentFilters = getFiltersFromUrl();

  // Load search results based on URL params
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        
        // Get the filters from the URL
        const filters = getFiltersFromUrl();
        
        // Add pagination
        const searchFilters = {
          ...filters,
          limit: ITEMS_PER_PAGE,
          offset
        };
        
        const { ads, count } = await searchAds(searchFilters);
        setResults(ads);
        setTotalCount(count);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Une erreur s'est produite lors de la recherche. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, page]);

  // Update URL when filters change
  const handleSearch = (newFilters: any) => {
    // Reset to first page when filters change
    setPage(1);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    // Only add non-empty filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        params.set(key, value as string);
      }
    });
    
    setSearchParams(params);
  };

  // Get the total number of pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageButtons = [];
    
    // Previous button
    pageButtons.push(
      <Button 
        key="prev" 
        variant="outline" 
        onClick={() => setPage(prev => Math.max(1, prev - 1))}
        disabled={page === 1}
        className="px-3"
      >
        Précédent
      </Button>
    );
    
    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button 
          key={i} 
          variant={i === page ? "default" : "outline"} 
          onClick={() => setPage(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      );
    }
    
    // Next button
    pageButtons.push(
      <Button 
        key="next" 
        variant="outline" 
        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
        disabled={page === totalPages}
        className="px-3"
      >
        Suivant
      </Button>
    );
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {pageButtons}
      </div>
    );
  };

  // Format search summary
  const getSearchSummary = () => {
    const parts = [];
    
    if (currentFilters.query) {
      parts.push(`"${currentFilters.query}"`);
    }
    
    if (currentFilters.category && currentFilters.category !== '0') {
      // Find the category name
      const categoryId = parseInt(currentFilters.category);
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      if (categoryName && categoryName !== 'Toutes les catégories') {
        parts.push(`dans ${categoryName}`);
      }
    }
    
    if (currentFilters.region && currentFilters.region !== '0') {
      // Find the region name
      const regionId = parseInt(currentFilters.region);
      const regionName = regions.find(r => r.id === regionId)?.name;
      if (regionName && regionName !== 'Tout le Cameroun') {
        parts.push(`à ${regionName}`);
      }
    }
    
    if (currentFilters.minPrice && currentFilters.maxPrice) {
      parts.push(`entre ${parseInt(currentFilters.minPrice).toLocaleString()} XAF et ${parseInt(currentFilters.maxPrice).toLocaleString()} XAF`);
    } else if (currentFilters.minPrice) {
      parts.push(`à partir de ${parseInt(currentFilters.minPrice).toLocaleString()} XAF`);
    } else if (currentFilters.maxPrice) {
      parts.push(`jusqu'à ${parseInt(currentFilters.maxPrice).toLocaleString()} XAF`);
    }
    
    if (parts.length === 0) {
      return "Toutes les annonces";
    }
    
    return parts.join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          {/* Search Filters */}
          <div className="mb-6">
            <SearchFilters 
              onSearch={handleSearch} 
              initialFilters={currentFilters}
            />
          </div>
          
          {/* Search Results */}
          <div className="bg-white border rounded-lg p-6">
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
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
            
            {!isLoading && results.length === 0 && !error ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Aucune annonce trouvée</h2>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou publiez votre propre annonce.
                </p>
                <Button 
                  asChild 
                  className="bg-mboa-orange hover:bg-mboa-orange/90"
                >
                  <Link to="/publier-annonce">
                    Publier une annonce
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                    <span className="ml-2">Chargement des résultats...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {results.map((ad) => (
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
                )}
                
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Mock data - Same as used in SearchFilters
const categories = [
  { id: 0, name: 'Toutes les catégories', slug: 'all' },
  { id: 1, name: 'Électronique', slug: 'electronique' },
  { id: 2, name: 'Véhicules', slug: 'vehicules' },
  { id: 3, name: 'Immobilier', slug: 'immobilier' },
  { id: 4, name: 'Vêtements', slug: 'vetements' },
  { id: 5, name: 'Services', slug: 'services' },
  { id: 6, name: 'Emploi', slug: 'emploi' },
];

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

export default SearchResults;
