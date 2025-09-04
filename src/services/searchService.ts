import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { getCategoryDbValue } from "./categoryMappingService";
import { sanitizeSearchQuery, sanitizeText } from "@/utils/inputSanitization";

interface SearchFilters {
  query?: string;
  category?: string;
  region?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  adType?: string;
}

interface SearchResponse {
  ads: Ad[];
  count: number;
}

export const searchAds = async (filters: SearchFilters): Promise<SearchResponse> => {
  console.log("Searching with filters:", filters);
  
  // Sanitize all input parameters
  const sanitizedFilters = {
    query: filters.query ? sanitizeSearchQuery(filters.query) : undefined,
    category: filters.category ? sanitizeText(filters.category, 50) : undefined,
    region: filters.region ? sanitizeText(filters.region, 100) : undefined,
    city: filters.city ? sanitizeText(filters.city, 100) : undefined,
    minPrice: filters.minPrice && filters.minPrice > 0 ? Math.max(0, filters.minPrice) : undefined,
    maxPrice: filters.maxPrice && filters.maxPrice > 0 ? Math.max(0, filters.maxPrice) : undefined,
    limit: filters.limit ? Math.min(Math.max(1, filters.limit), 100) : 12,
    offset: filters.offset ? Math.max(0, filters.offset) : 0,
    adType: filters.adType ? sanitizeText(filters.adType, 50) : undefined,
  };
  
  console.log("Sanitized filters:", sanitizedFilters);
  
  try {
    // Use secure function for public ad search with larger initial fetch to enable filtering
    const { data: allAds, error: baseError } = await supabase
      .rpc('get_public_ads_safe', { p_limit: 1000, p_offset: 0 });
    
    if (baseError) {
      console.error('Error fetching ads:', baseError);
      throw baseError;
    }
    
    // Filter results based on search criteria
    let filteredAds = allAds || [];

    // Apply search term filter
    if (sanitizedFilters.query && sanitizedFilters.query.trim() !== '') {
      const searchLower = sanitizedFilters.query.toLowerCase();
      filteredAds = filteredAds.filter(ad => 
        ad.title.toLowerCase().includes(searchLower) || 
        ad.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (sanitizedFilters.category && sanitizedFilters.category !== 'all' && sanitizedFilters.category !== '0') {
      console.log("Applying category filter:", { 
        originalCategory: sanitizedFilters.category,
        categoryType: typeof sanitizedFilters.category
      });
      
      filteredAds = filteredAds.filter(ad => ad.category === sanitizedFilters.category);
      console.log("Final category filter applied:", sanitizedFilters.category);
    }

    // Apply region filter
    if (sanitizedFilters.region && sanitizedFilters.region !== 'all' && sanitizedFilters.region !== '0') {
      filteredAds = filteredAds.filter(ad => ad.region === sanitizedFilters.region);
    }

    // Apply city filter
    if (sanitizedFilters.city && sanitizedFilters.city !== 'all' && sanitizedFilters.city !== '0') {
      filteredAds = filteredAds.filter(ad => ad.city === sanitizedFilters.city);
    }

    // Apply price filters
    if (sanitizedFilters.minPrice !== undefined && sanitizedFilters.minPrice > 0) {
      filteredAds = filteredAds.filter(ad => ad.price >= sanitizedFilters.minPrice!);
    }

    if (sanitizedFilters.maxPrice !== undefined && sanitizedFilters.maxPrice > 0) {
      filteredAds = filteredAds.filter(ad => ad.price <= sanitizedFilters.maxPrice!);
    }

    // Apply ad type filter
    if (sanitizedFilters.adType && sanitizedFilters.adType !== 'all') {
      filteredAds = filteredAds.filter(ad => ad.ad_type === sanitizedFilters.adType);
    }

    // Sort by relevance and date (premium first, then by creation date)
    filteredAds.sort((a, b) => {
      // Premium ads first
      const aIsPremium = a.ad_type !== 'standard';
      const bIsPremium = b.ad_type !== 'standard';
      
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      
      // Then by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply pagination
    const totalCount = filteredAds.length;
    const startIndex = sanitizedFilters.offset;
    const endIndex = startIndex + sanitizedFilters.limit;
    const paginatedAds = filteredAds.slice(startIndex, endIndex);

    console.log("Search results:", { 
      foundAds: paginatedAds.length, 
      totalCount: totalCount,
      filters: sanitizedFilters,
      actualResultsCategories: paginatedAds.map(ad => ad.category) || []
    });

    // Add imageUrl to each ad (using first image or placeholder)
    const adsWithImages = await Promise.all(
      paginatedAds.map(async (ad) => {
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
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg',
            phone: '', // Hidden for public access
            whatsapp: '', // Hidden for public access  
            user_id: '', // Hidden for public access
            reject_reason: undefined // Hidden for public access
          };
        } catch (error) {
          console.error("Error processing ad images:", error);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            phone: '', // Hidden for public access
            whatsapp: '', // Hidden for public access  
            user_id: '', // Hidden for public access
            reject_reason: undefined // Hidden for public access
          };
        }
      })
    );

    return {
      ads: adsWithImages as Ad[],
      count: totalCount
    };
  } catch (error) {
    console.error("Search service error:", error);
    throw new Error("Search failed. Please try again.");
  }
};