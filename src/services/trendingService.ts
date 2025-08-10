
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
    
    // Récupérer toutes les annonces approuvées qui ne sont pas de type "standard"
    // Ceci inclut toutes les anciennes annonces premium, même celles avec des transactions obsolètes
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .neq('ad_type', 'standard') // Toutes les annonces non-standard sont maintenant considérées comme mises en avant
      .order('created_at', { ascending: false })
      .limit(limit);
    
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
    console.error("Error fetching featured ads:", error);
    return [];
  }
};

// Fonction pour récupérer les annonces tendances (mix d'annonces récentes et populaires)
export const fetchTrendingAds = async (limit: number = 10): Promise<Ad[]> => {
  try {
    console.log("Fetching trending ads...");
    
    // Récupérer un mélange d'annonces récentes et d'annonces mises en avant
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
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
    console.error("Error fetching trending ads:", error);
    return [];
  }
};
