
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

// Fonction pour récupérer les annonces approuvées récentes
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Récupérer les annonces approuvées les plus récentes
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error retrieving approved ads:", error);
      throw error;
    }
    
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
    console.error("Error fetching approved ads:", error);
    return [];
  }
};
