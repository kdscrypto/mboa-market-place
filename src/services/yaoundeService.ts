import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

/**
 * Validates if the provided string is a valid URL or relative path
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  // Check if it's a relative path starting with /
  if (url.startsWith('/')) return true;
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Fetches trending ads specifically from Yaoundé
 * Premium ads are prioritized at the top, followed by standard ads sorted by creation date
 */
export const fetchYaoundeAds = async (limit: number = 12): Promise<Ad[]> => {
  try {
    console.log("Fetching Yaoundé trending ads...");
    
    // Use the secure RPC function to get homepage ads
    const { data: adsData, error: adsError } = await supabase.rpc('get_homepage_ads', {
      p_limit: 50 // Get more ads to filter for Yaoundé specifically
    });

    if (adsError) {
      console.error("Error fetching ads:", adsError);
      throw new Error(`Database error: ${adsError.message}`);
    }

    if (!adsData || !Array.isArray(adsData)) {
      console.warn("No ads data received or invalid format");
      return [];
    }

    // Filter for Yaoundé ads only
    const yaoundeAds = adsData.filter((ad: any) => 
      ad.city && ad.city.toLowerCase() === 'yaoundé'
    );

    console.log(`Found ${yaoundeAds.length} Yaoundé ads out of ${adsData.length} total ads`);

    // Sort ads: Premium first (by creation date desc), then Standard (by creation date desc)
    const sortedAds = yaoundeAds.sort((a: any, b: any) => {
      // Premium ads (non-standard) always come first
      const aIsPremium = a.ad_type !== 'standard';
      const bIsPremium = b.ad_type !== 'standard';
      
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      
      // Within the same type, sort by creation date (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Take only the requested limit
    const limitedAds = sortedAds.slice(0, limit);

    // Fetch primary images for each ad
    const adsWithImages = await Promise.all(
      limitedAds.map(async (ad: any) => {
        try {
          // Get the primary image (position 0) for this ad
          const { data: imageData, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .eq('position', 0)
            .maybeSingle();

          let imageUrl = '/placeholder.svg'; // Default fallback
          
          if (!imageError && imageData?.image_url && isValidImageUrl(imageData.image_url)) {
            imageUrl = imageData.image_url;
          }

          // Return the ad with proper typing and security
          return {
            id: ad.id,
            title: ad.title || 'Titre non disponible',
            description: ad.description || '',
            price: ad.price || 0,
            category: ad.category || 'Autre',
            city: ad.city || '',
            region: ad.region || '',
            status: ad.status,
            created_at: ad.created_at,
            imageUrl,
            // Mask sensitive data for security
            phone: '***', 
            user_id: '***',
            whatsapp: undefined,
            is_premium: ad.ad_type !== 'standard',
            ad_type: ad.ad_type,
            premium_expires_at: ad.premium_expires_at
          } as Ad;
        } catch (error) {
          console.error(`Error processing ad ${ad.id}:`, error);
          // Return ad with fallback image if there's an error
          return {
            id: ad.id,
            title: ad.title || 'Titre non disponible',
            description: ad.description || '',
            price: ad.price || 0,
            category: ad.category || 'Autre',
            city: ad.city || '',
            region: ad.region || '',
            status: ad.status,
            created_at: ad.created_at,
            imageUrl: '/placeholder.svg',
            phone: '***',
            user_id: '***',
            whatsapp: undefined,
            is_premium: ad.ad_type !== 'standard',
            ad_type: ad.ad_type,
            premium_expires_at: ad.premium_expires_at
          } as Ad;
        }
      })
    );

    console.log(`Successfully processed ${adsWithImages.length} Yaoundé ads with images`);
    return adsWithImages;

  } catch (error) {
    console.error("Error in fetchYaoundeAds:", error);
    throw error;
  }
};