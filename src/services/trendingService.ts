
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

// Helper function to validate image URLs
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;
  
  // Reject placeholder URLs
  if (trimmedUrl.includes('placeholder') || trimmedUrl.startsWith('/placeholder')) {
    return false;
  }
  
  // Check if it's a valid Supabase Storage URL
  if (trimmedUrl.includes('supabase.co/storage/v1/object/public')) {
    return true;
  }
  
  // Check if it's a valid external URL
  try {
    const urlObj = new URL(trimmedUrl);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
};

export const fetchPremiumAds = async (limit: number = 20): Promise<Ad[]> => {
  try {
    console.log("Fetching featured ads (formerly premium)...");
    
    // Use secure function to get homepage ads and filter non-standard ones
    const { data: allAds, error: homeError } = await supabase
      .rpc('get_homepage_ads', { p_limit: limit * 2 }); // Get more to filter
    
    if (homeError) {
      console.error("Error retrieving homepage ads:", homeError);
      throw homeError;
    }
    
    // Filter for non-standard ads (formerly premium)
    const ads = (allAds || []).filter(ad => ad.ad_type !== 'standard').slice(0, limit);
    const error = null;
    
    if (error) {
      console.error("Error retrieving featured ads:", error);
      throw error;
    }

    console.log(`Retrieved ${ads?.length || 0} featured ads`);
    
    // Pour chaque annonce, récupérer l'image principale
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
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg',
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
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

// Fonction pour récupérer les annonces tendances (mix d'annonces récentes et populaires)
export const fetchTrendingAds = async (limit: number = 10): Promise<Ad[]> => {
  try {
    console.log("Fetching trending ads...");
    
    // Use secure function to get trending ads (recent approved ads)
    const { data: ads, error } = await supabase
      .rpc('get_homepage_ads', { p_limit: limit });
    
    if (error) {
      console.error("Error retrieving trending ads:", error);
      throw error;
    }

    console.log(`Retrieved ${ads?.length || 0} trending ads`);
    
    // Ajouter les images
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
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg',
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
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
