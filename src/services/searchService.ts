
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { categories, regions } from "@/data/categoriesData";

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

    // Apply filters
    if (filters.query && filters.query.trim() !== '') {
      // Full text search using ilike for simple case
      query = query.ilike('title', `%${filters.query.trim()}%`);
    }

    if (filters.category && filters.category !== 'all') {
      // Direct matching on category slug
      query = query.eq('category', filters.category);
    }

    if (filters.region && filters.region !== 'all') {
      // Direct matching on region slug
      query = query.eq('region', filters.region);
    }

    if (filters.minPrice && Number(filters.minPrice) > 0) {
      query = query.gte('price', Number(filters.minPrice));
    }

    if (filters.maxPrice && Number(filters.maxPrice) > 0) {
      query = query.lte('price', Number(filters.maxPrice));
    }

    // First sort by ad_type (premium first), then by most recent
    query = query.order('ad_type', { ascending: false });
    query = query.order('created_at', { ascending: false });

    // Apply pagination if provided
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
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
