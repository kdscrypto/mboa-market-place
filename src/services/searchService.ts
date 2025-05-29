
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

interface SearchFilters {
  query?: string;
  category?: string;
  region?: string;
  minPrice?: string;
  maxPrice?: string;
  limit?: number;
  offset?: number;
}

export const searchAds = async (filters: SearchFilters): Promise<{ ads: Ad[], count: number }> => {
  try {
    console.log("Searching with filters:", filters);

    // Start building the query
    let query = supabase
      .from('ads')
      .select('*', { count: 'exact' })
      .eq('status', 'approved');

    // Apply text search with ILIKE for partial, case-insensitive matching
    if (filters.query && filters.query.trim() !== '') {
      const searchQuery = filters.query.trim();
      
      // Split search query into individual words for AND logic
      const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length === 1) {
        // Single word search - search in title OR description
        const word = searchWords[0];
        query = query.or(`title.ilike.%${word}%,description.ilike.%${word}%`);
      } else if (searchWords.length > 1) {
        // Multiple words - each word must be found in at least one field (AND logic across words)
        // Build a complex filter where each word can match in either title OR description
        const wordFilters = searchWords.map(word => 
          `or(title.ilike.%${word}%,description.ilike.%${word}%)`
        );
        
        // Apply each word filter as an AND condition
        const filterString = `and(${wordFilters.join(',')})`;
        query = query.or(filterString);
      }
    }

    // Apply category filter
    if (filters.category && filters.category !== '0' && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Apply region filter
    if (filters.region && filters.region !== '0' && filters.region !== 'all') {
      query = query.eq('region', filters.region);
    }

    // Apply price filters
    if (filters.minPrice && Number(filters.minPrice) > 0) {
      query = query.gte('price', Number(filters.minPrice));
    }

    if (filters.maxPrice && Number(filters.maxPrice) > 0) {
      query = query.lte('price', Number(filters.maxPrice));
    }

    // Sort by ad_type (premium first), then by most recent
    query = query.order('ad_type', { ascending: false });
    query = query.order('created_at', { ascending: false });

    // Apply pagination if provided
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    // Execute the query
    const { data: ads, error, count } = await query;

    if (error) {
      console.error("Error retrieving ads:", error);
      throw error;
    }

    console.log(`Found ${count || 0} ads matching the filters`);

    // For each ad, retrieve the main image
    const adsWithImages = await Promise.all(
      (ads || []).map(async (ad) => {
        try {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          if (imageError) {
            console.error(`Error retrieving images for ad ${ad.id}:`, imageError);
          }
          
          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg'
          };
        }
      })
    );
    
    return { 
      ads: adsWithImages,
      count: count || 0
    };
  } catch (error) {
    console.error("Error in searchAds:", error);
    return { ads: [], count: 0 };
  }
};
