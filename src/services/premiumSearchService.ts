import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

interface PremiumSearchFilters {
  query?: string;
  category?: string;
  region?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const searchPremiumAds = async (filters: PremiumSearchFilters = {}, limit: number = 12) => {
  console.log("Searching featured ads (formerly premium) with filters:", filters);
  
  // Use secure function for premium ads
  const { data: allAds, error: baseError } = await supabase
    .rpc('get_public_ads_safe', { p_limit: 100, p_offset: 0 });
  
  if (baseError) {
    console.error('Error fetching premium ads:', baseError);
    throw baseError;
  }
  
  // Filter for premium ads that haven't expired (if they have expiration)
  let premiumAds = (allAds || [])
    .filter(ad => {
      // Include all non-standard ad types
      if (ad.ad_type === 'standard') return false;
      
      // If premium_expires_at exists, check if it's still valid
      if (ad.premium_expires_at) {
        return new Date(ad.premium_expires_at) > new Date();
      }
      
      // If no expiration date, include it (permanent premium)
      return true;
    });

  // Apply filters
  if (filters.query && filters.query.trim() !== '') {
    const queryLower = filters.query.toLowerCase();
    premiumAds = premiumAds.filter(ad => 
      ad.title.toLowerCase().includes(queryLower) ||
      ad.description.toLowerCase().includes(queryLower)
    );
  }

  if (filters.category && filters.category !== '') {
    premiumAds = premiumAds.filter(ad => ad.category === filters.category);
  }

  if (filters.region && filters.region !== '' && filters.region !== '0') {
    premiumAds = premiumAds.filter(ad => ad.region === filters.region);
  }

  if (filters.city && filters.city !== '') {
    premiumAds = premiumAds.filter(ad => ad.city === filters.city);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    premiumAds = premiumAds.filter(ad => ad.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    premiumAds = premiumAds.filter(ad => ad.price <= filters.maxPrice!);
  }

  // Sort by creation date descending to show newest first
  premiumAds.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Apply limit
  const limitedAds = premiumAds.slice(0, limit);

  console.log("Featured ads search results:", { 
    foundAds: limitedAds.length, 
    filters 
  });

  // Add imageUrl to each ad
  const adsWithImages = await Promise.all(
    limitedAds.map(async (ad) => {
      const { data: images } = await supabase
        .from('ad_images')
        .select('image_url')
        .eq('ad_id', ad.id)
        .order('position')
        .limit(1);

      return {
        ...ad,
        imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg',
        phone: '', // Hidden for public access
        whatsapp: '', // Hidden for public access
        user_id: '', // Hidden for public access
        reject_reason: undefined // Hidden for public access
      };
    })
  );

  return adsWithImages as Ad[];
};

export const getUniqueValues = (ads: Ad[], field: keyof Ad): string[] => {
  const values = ads.map(ad => ad[field] as string).filter(Boolean);
  return [...new Set(values)].sort();
};