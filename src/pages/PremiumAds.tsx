
import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPremiumAds } from "@/services/trendingService";
import { searchPremiumAds, getUniqueValues } from "@/services/premiumSearchService";
import { Ad } from "@/types/adTypes";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumBadge from "@/components/PremiumBadge";
import SearchFilters from "@/components/SearchFilters";
import PremiumSearchResults from "@/components/premium/PremiumSearchResults";
import { toast } from "@/hooks/use-toast";

const PremiumAds = () => {
  const [premiumAds, setPremiumAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [hasActiveFilters, setHasActiveFilters] = useState<boolean>(false);

  // Load all premium ads initially
  useEffect(() => {
    loadPremiumAds();
  }, []);

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

  const handleSearch = useCallback(async (filters: any) => {
    console.log("Premium search filters:", filters);
    
    const hasFilters = Object.keys(filters).length > 0;
    setHasActiveFilters(hasFilters);
    
    if (!hasFilters) {
      setFilteredAds(premiumAds);
      return;
    }

    setIsSearching(true);
    try {
      // Convert the filters to match the premium search service format
      const searchParams: any = {};
      
      if (filters.query) searchParams.query = filters.query;
      if (filters.category) searchParams.category = filters.category;
      if (filters.minPrice) searchParams.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) searchParams.maxPrice = parseInt(filters.maxPrice);
      
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
  }, [premiumAds]);

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
              {/* Search Filters */}
              <SearchFilters
                onSearch={handleSearch}
                showRegion={false}
                placeholder="Rechercher dans les annonces premium..."
                searchButtonText="Rechercher"
                className="mb-6"
              />

              {/* Results */}
              <div className="bg-white border rounded-lg p-6">
                <PremiumSearchResults
                  ads={filteredAds}
                  isSearching={isSearching}
                  hasFilters={hasActiveFilters}
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
