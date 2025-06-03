
import { useState, useEffect, useCallback } from "react";
import { fetchPremiumAds } from "@/services/trendingService";
import { searchPremiumAds } from "@/services/premiumSearchService";
import { Ad } from "@/types/adTypes";
import { toast } from "@/hooks/use-toast";

export const usePremiumAdsData = () => {
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

  return {
    premiumAds,
    filteredAds,
    isLoading,
    isSearching,
    error,
    isRetrying,
    hasActiveFilters,
    handleSearch,
    handleRetry
  };
};
