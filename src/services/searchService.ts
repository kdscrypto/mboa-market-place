
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { getCategoryDbValue } from "./categoryMappingService";

interface SearchFilters {
  query?: string;
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export const searchAds = async (filters: SearchFilters) => {
  console.log("Searching with filters:", filters);
  
  let query = supabase
    .from('ads')
    .select('*', { count: 'exact' })
    .eq('status', 'approved');

  // Apply filters
  if (filters.query && filters.query.trim() !== '') {
    query = query.ilike('title', `%${filters.query}%`);
  }

  if (filters.category && filters.category !== 'all' && filters.category !== '0') {
    // Use the category ID directly instead of converting it
    console.log("Applying category filter:", { 
      originalCategory: filters.category,
      categoryType: typeof filters.category
    });
    
    // Check what's actually in the database first
    const { data: allAds } = await supabase
      .from('ads')
      .select('category')
      .eq('status', 'approved')
      .limit(50);
    
    const uniqueCategories = [...new Set(allAds?.map(ad => ad.category) || [])];
    console.log("Available categories in database:", uniqueCategories);
    
    // Use the category value directly (should be the category ID as string)
    query = query.eq('category', filters.category);
    
    console.log("Final category filter applied:", filters.category);
  }

  if (filters.region && filters.region !== 'all' && filters.region !== '0') {
    query = query.eq('region', filters.region);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice);
  }

  // Add pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  // Execute query
  console.log("Executing search query with category:", filters.category);
  const { data, error, count } = await query;

  if (error) {
    console.error("Search error:", error);
    throw error;
  }

  console.log("Search results:", { 
    foundAds: data?.length || 0, 
    totalCount: count,
    filters: filters,
    actualResultsCategories: data?.map(ad => ad.category) || []
  });

  // Add imageUrl to each ad (using first image or placeholder)
  const adsWithImages = await Promise.all(
    (data || []).map(async (ad) => {
      const { data: images } = await supabase
        .from('ad_images')
        .select('image_url')
        .eq('ad_id', ad.id)
        .order('position')
        .limit(1);

      return {
        ...ad,
        imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
      };
    })
  );

  return {
    ads: adsWithImages as Ad[],
    count: count || 0
  };
};
