
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { sanitizeText } from "@/utils/inputSanitization";
import { validateAdServiceAuth } from "./adAuthService";

/**
 * Service pour récupérer les annonces
 */
export const fetchAdsWithStatus = async (status: string): Promise<Ad[]> => {
  try {
    console.log(`Fetching ads with status: ${status}`);
    
    // Sanitize status input
    const sanitizedStatus = sanitizeText(status, 50);
    if (!['pending', 'approved', 'rejected'].includes(sanitizedStatus)) {
      throw new Error("Invalid status parameter");
    }
    
    // Validate authentication and permissions
    await validateAdServiceAuth();
    
    // Fetch ads with the specified status
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', sanitizedStatus)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error retrieving ads with status ${sanitizedStatus}:`, error);
      throw error;
    }
    
    console.log(`${sanitizedStatus} ads retrieved:`, ads?.length || 0);
    
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
    
    return adsWithImages;
  } catch (error) {
    console.error(`Error retrieving ads with status ${status}:`, error);
    throw error;
  }
};
