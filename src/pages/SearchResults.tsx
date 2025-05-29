
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/SearchFilters";
import SearchResultsHeader from "@/components/search/SearchResultsHeader";
import SearchResultsContent from "@/components/search/SearchResultsContent";
import { searchAds } from "@/services/searchService";
import { Ad } from "@/types/adTypes";

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
        
        // Convert string values to appropriate types for the search service
        const searchFilters = {
          query: filters.query,
          category: filters.category,
          region: filters.region,
          limit: ITEMS_PER_PAGE,
          offset,
          // Convert price strings to numbers, only if they're not empty
          ...(filters.minPrice && { minPrice: parseInt(filters.minPrice) }),
          ...(filters.maxPrice && { maxPrice: parseInt(filters.maxPrice) })
        };
        
        console.log("Executing search with enhanced ILIKE functionality:", searchFilters);
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
            <SearchResultsHeader 
              totalCount={totalCount}
              isLoading={isLoading}
              error={error}
              filters={currentFilters}
            />
            
            <SearchResultsContent 
              results={results}
              isLoading={isLoading}
              error={error}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
