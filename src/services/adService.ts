
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

// Fonction pour récupérer toutes les annonces avec leurs images principales
export const fetchAdsWithStatus = async (status: string): Promise<Ad[]> => {
  try {
    console.log(`Fetching ads with status: ${status}`);
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.error("No active session found");
      throw new Error("Not authenticated");
    }
    
    // Fetch all ads with the specified status, without filtering by user_id
    // This ensures moderators can see all ads from all users
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération des annonces ${status}:`, error);
      throw error;
    }
    
    console.log(`${status} ads retrieved:`, ads);
    
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
    return [];
  }
};

// Fonction pour mettre à jour le statut d'une annonce
export const updateAdStatus = async (adId: string, status: 'approved' | 'rejected'): Promise<boolean> => {
  try {
    console.log(`Updating ad ${adId} to status: ${status}`);
    
    const { error } = await supabase
      .from('ads')
      .update({ status })
      .eq('id', adId);
    
    if (error) {
      console.error(`Error updating ad ${adId}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ad ${adId} to ${status}:`, error);
    return false;
  }
};
