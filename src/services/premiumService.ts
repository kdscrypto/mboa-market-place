
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

// Interface pour les annonces premium groupées
export interface GroupedPremiumAds {
  category: string;
  city: string;
  ads: Ad[];
}

// Fonction pour récupérer toutes les annonces premium (maintenant toutes gratuites)
export const fetchAllPremiumAds = async (): Promise<Ad[]> => {
  try {
    console.log("Fetching all featured ads (formerly premium)");
    
    // Use secure function to get all ads and filter for non-standard ones
    const { data: allAds, error: homeError } = await supabase
      .rpc('get_homepage_ads', { p_limit: 100 }); // Get many ads to filter
    
    if (homeError) {
      console.error("Error retrieving homepage ads:", homeError);
      throw homeError;
    }
    
    // Filter for non-standard ads (formerly premium)
    const ads = (allAds || []).filter(ad => ad.ad_type !== 'standard');
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
    console.error("Error fetching all featured ads:", error);
    return [];
  }
};

// Fonction pour regrouper les annonces par catégorie et ville
export const groupPremiumAdsByCategoryAndCity = (ads: Ad[]): GroupedPremiumAds[] => {
  const groupedAds: GroupedPremiumAds[] = [];
  
  // Créer un Map pour regrouper les annonces
  const adGroups = new Map<string, Ad[]>();
  
  // Regrouper les annonces par catégorie et ville
  for (const ad of ads) {
    const key = `${ad.category}:${ad.city}`;
    if (!adGroups.has(key)) {
      adGroups.set(key, []);
    }
    adGroups.get(key)!.push(ad);
  }
  
  // Convertir le Map en tableau de GroupedPremiumAds
  for (const [key, adsGroup] of adGroups.entries()) {
    const [category, city] = key.split(':');
    groupedAds.push({
      category,
      city,
      ads: adsGroup
    });
  }
  
  return groupedAds;
};
