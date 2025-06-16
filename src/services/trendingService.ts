
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

// Helper function to validate image URLs
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(trimmedUrl);
    return true;
  } catch {
    // If it's not a valid URL, check if it's a relative path
    return trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../');
  }
};

export const fetchPremiumAds = async (limit: number = 20): Promise<Ad[]> => {
  try {
    console.log("Fetching featured ads (formerly premium)...");
    
    // Use optimized query that doesn't trigger RLS recursion
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id,
        title,
        description,
        category,
        region,
        city,
        price,
        phone,
        whatsapp,
        status,
        ad_type,
        premium_expires_at,
        created_at,
        updated_at,
        user_id
      `)
      .eq('status', 'approved')
      .neq('ad_type', 'standard')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error retrieving featured ads:", error);
      return [];
    }

    console.log(`Retrieved ${ads?.length || 0} featured ads`);
    
    if (!ads || ads.length === 0) {
      return [];
    }
    
    // Process images with proper error handling
    const adsWithImages = await Promise.all(
      ads.map(async (ad) => {
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
          
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
            }
          }
          
          return {
            ...ad,
            imageUrl,
            is_premium: true // All non-standard ads are premium
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: true
          };
        }
      })
    );
    
    return adsWithImages;
  } catch (error) {
    console.error("Error fetching featured ads:", error);
    return [];
  }
};

// Function to fetch trending ads (mix of recent and popular ads)
export const fetchTrendingAds = async (limit: number = 10): Promise<Ad[]> => {
  try {
    console.log("Fetching trending ads...");
    
    // Use optimized query for trending ads
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id,
        title,
        description,
        category,
        region,
        city,
        price,
        phone,
        whatsapp,
        status,
        ad_type,
        premium_expires_at,
        created_at,
        updated_at,
        user_id
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error retrieving trending ads:", error);
      return [];
    }

    console.log(`Retrieved ${ads?.length || 0} trending ads`);
    
    if (!ads || ads.length === 0) {
      return [];
    }
    
    // Add images with proper error handling
    const adsWithImages = await Promise.all(
      ads.map(async (ad) => {
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
          
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
            }
          }
          
          return {
            ...ad,
            imageUrl,
            is_premium: ad.ad_type !== 'standard'
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: ad.ad_type !== 'standard'
          };
        }
      })
    );
    
    return adsWithImages;
  } catch (error) {
    console.error("Error fetching trending ads:", error);
    return [];
  }
};
