
import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPremiumAds } from "@/services/trendingService";
import { searchPremiumAds, getUniqueValues } from "@/services/premiumSearchService";
import { Ad } from "@/types/adTypes";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumBadge from "@/components/PremiumBadge";
import PremiumFilters from "@/components/premium/PremiumFilters";
import PremiumSearchResults from "@/components/premium/PremiumSearchResults";
import { usePremiumFilters } from "@/hooks/usePremiumFilters";
import { toast } from "@/components/ui/use-toast";

const PremiumAds = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const {
    filters,
    updateFilter,
    resetFilters,
    getSearchParams,
    hasActiveFilters
  } = usePremiumFilters();

  // Load all premium ads initially
  useEffect(() => {
    loadPremiumAds();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasActiveFilters()) {
        performSearch();
      } else {
        setFilteredAds(premiumAds);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, premiumAds, hasActiveFilters]);

  const loadPremiumAds = async () => {
    setIsLoading(true);
    setError(false);
    try {
      console.log("Loading all premium ads...");
      const ads = await fetchPremiumAds(100); // Load more ads for filtering
      console.log("Premium ads loaded:", ads.length);
      setPremiumAds(ads);
      setFilteredAds(ads);
    } catch (err) {
      console.error("Error loading premium ads:", err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = useCallback(async () => {
    if (!hasActiveFilters()) {
      setFilteredAds(premiumAds);
      return;
    }

    setIsSearching(true);
    try {
      const searchParams = getSearchParams();
      console.log("Performing premium search with params:", searchParams);
      
      const results = await searchPremiumAds(searchParams);
      setFilteredAds(results);
      
      console.log("Search completed:", {
        query: searchParams,
        resultsCount: results.length
      });
    } catch (err) {
      console.error("Error searching premium ads:", err);
      toast({
        description: "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [filters, premiumAds, hasActiveFilters, getSearchParams]);

  const handleRetry = () => {
    setIsRetrying(true);
    
    const retryLoad = async () => {
      try {
        const ads = await fetchPremiumAds(100);
        setPremiumAds(ads);
        setFilteredAds(ads);
        setError(false);
        toast({
          description: "Données rafraîchies avec succès",
        });
      } catch (err) {
        console.error("Error reloading premium ads:", err);
        setError(true);
        toast({
          description: "Impossible de charger les annonces",
          variant: "destructive",
        });
      } finally {
        setIsRetrying(false);
      }
    };
    
    retryLoad();
  };

  const handleResetFilters = () => {
    resetFilters();
    setFilteredAds(premiumAds);
  };

  // Get unique values for filters
  const uniqueCategories = getUniqueValues(premiumAds, 'category');
  const uniqueCities = getUniqueValues(premiumAds, 'city');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="mboa-container py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">Annonces Premium</h1>
              <PremiumBadge />
            </div>
            <p className="text-gray-600">
              Découvrez toutes nos annonces premium mises en avant
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
                <span className="ml-2">Chargement des annonces premium...</span>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Une erreur s'est produite</h3>
                <p className="mb-4 text-gray-600">Impossible de charger les annonces premium.</p>
                
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Réessayer
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Main Content */
            <>
              {/* Filters */}
              <PremiumFilters
                searchQuery={filters.query}
                onSearchChange={(query) => updateFilter('query', query)}
                uniqueCategories={uniqueCategories}
                uniqueCities={uniqueCities}
                filterCategory={filters.category}
                setFilterCategory={(category) => updateFilter('category', category)}
                filterCity={filters.city}
                setFilterCity={(city) => updateFilter('city', city)}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onMinPriceChange={(price) => updateFilter('minPrice', price)}
                onMaxPriceChange={(price) => updateFilter('maxPrice', price)}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters()}
              />

              {/* Results */}
              <div className="bg-white border rounded-lg p-6">
                <PremiumSearchResults
                  ads={filteredAds}
                  isSearching={isSearching}
                  hasFilters={hasActiveFilters()}
                  totalAdsCount={premiumAds.length}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PremiumAds;
