
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { getCategoryDbValue } from "./categoryMappingService";
import { sanitizeSearchQuery, sanitizeText } from "@/utils/inputSanitization";

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
  
  // Sanitize all input parameters
  const sanitizedFilters = {
    query: filters.query ? sanitizeSearchQuery(filters.query) : undefined,
    category: filters.category ? sanitizeText(filters.category, 50) : undefined,
    region: filters.region ? sanitizeText(filters.region, 100) : undefined,
    minPrice: filters.minPrice && filters.minPrice > 0 ? Math.max(0, filters.minPrice) : undefined,
    maxPrice: filters.maxPrice && filters.maxPrice > 0 ? Math.max(0, filters.maxPrice) : undefined,
    limit: filters.limit ? Math.min(Math.max(1, filters.limit), 100) : undefined, // Limit between 1-100
    offset: filters.offset ? Math.max(0, filters.offset) : undefined,
  };
  
  console.log("Sanitized filters:", sanitizedFilters);
  
  try {
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Authentication error");
    }

    let query = supabase
      .from('ads')
      .select('*', { count: 'exact' })
      .eq('status', 'approved'); // Only show approved ads to public

    // Apply filters with sanitized inputs
    if (sanitizedFilters.query && sanitizedFilters.query.trim() !== '') {
      query = query.ilike('title', `%${sanitizedFilters.query}%`);
    }

    if (sanitizedFilters.category && sanitizedFilters.category !== 'all' && sanitizedFilters.category !== '0') {
      console.log("Applying category filter:", { 
        originalCategory: sanitizedFilters.category,
        categoryType: typeof sanitizedFilters.category
      });
      
      query = query.eq('category', sanitizedFilters.category);
      console.log("Final category filter applied:", sanitizedFilters.category);
    }

    if (sanitizedFilters.region && sanitizedFilters.region !== 'all' && sanitizedFilters.region !== '0') {
      query = query.eq('region', sanitizedFilters.region);
    }

    if (sanitizedFilters.minPrice !== undefined && sanitizedFilters.minPrice > 0) {
      query = query.gte('price', sanitizedFilters.minPrice);
    }

    if (sanitizedFilters.maxPrice !== undefined && sanitizedFilters.maxPrice > 0) {
      query = query.lte('price', sanitizedFilters.maxPrice);
    }

    // Add pagination with limits
    if (sanitizedFilters.limit) {
      query = query.limit(sanitizedFilters.limit);
    }

    if (sanitizedFilters.offset) {
      query = query.range(sanitizedFilters.offset, sanitizedFilters.offset + (sanitizedFilters.limit || 10) - 1);
    }

    // Execute query
    console.log("Executing search query with category:", sanitizedFilters.category);
    const { data, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    console.log("Search results:", { 
      foundAds: data?.length || 0, 
      totalCount: count,
      filters: sanitizedFilters,
      actualResultsCategories: data?.map(ad => ad.category) || []
    });

    // Add imageUrl to each ad (using first image or placeholder)
    const adsWithImages = await Promise.all(
      (data || []).map(async (ad) => {
        try {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position')
            .limit(1);

          if (imageError) {
            console.error("Error fetching images for ad:", ad.id, imageError);
          }

          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        } catch (error) {
          console.error("Error processing ad images:", error);
          return {
            ...ad,
            imageUrl: '/placeholder.svg'
          };
        }
      })
    );

    return {
      ads: adsWithImages as Ad[],
      count: count || 0
    };
  } catch (error) {
    console.error("Search service error:", error);
    throw new Error("Search failed. Please try again.");
  }
};

