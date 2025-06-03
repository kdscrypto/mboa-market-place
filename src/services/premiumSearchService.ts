
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

interface PremiumSearchFilters {
  query?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const searchPremiumAds = async (filters: PremiumSearchFilters = {}) => {
  console.log("Searching premium ads with filters:", filters);
  
  let query = supabase
    .from('ads')
    .select('*')
    .eq('status', 'approved')
    .eq('ad_type', 'premium');

  // Apply filters
  if (filters.query && filters.query.trim() !== '') {
    query = query.ilike('title', `%${filters.query}%`);
  }

  if (filters.category && filters.category !== '') {
    query = query.eq('category', filters.category);
  }

  if (filters.city && filters.city !== '') {
    query = query.eq('city', filters.city);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query = query.lte('price', filters.maxPrice);
  }

  // Order by created_at descending to show newest first
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Premium search error:", error);
    throw error;
  }

  console.log("Premium search results:", { 
    foundAds: data?.length || 0, 
    filters 
  });

  // Add imageUrl to each ad
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

  return adsWithImages as Ad[];
};

export const getUniqueValues = (ads: Ad[], field: keyof Ad): string[] => {
  const values = ads.map(ad => ad[field] as string).filter(Boolean);
  return [...new Set(values)].sort();
};
