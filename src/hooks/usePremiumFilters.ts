import { useState, useCallback } from "react";

interface FeaturedFilters {
  query: string;
  category: string | null;
  city: string | null;
  minPrice: string;
  maxPrice: string;
}

const initialFilters: FeaturedFilters = {
  query: '',
  category: null,
  city: null,
  minPrice: '',
  maxPrice: ''
};

// Updated to reflect that all ads are now free, but we keep filtering functionality
export const usePremiumFilters = () => {
  const [filters, setFilters] = useState<FeaturedFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof FeaturedFilters, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const getSearchParams = useCallback(() => {
    const params: any = {};
    
    if (filters.query.trim()) params.query = filters.query;
    if (filters.category) params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice) params.minPrice = parseInt(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseInt(filters.maxPrice);
    
    return params;
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return filters.query.trim() !== '' || 
           filters.category !== null || 
           filters.city !== null || 
           filters.minPrice !== '' || 
           filters.maxPrice !== '';
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    getSearchParams,
    hasActiveFilters
  };
};
