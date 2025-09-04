import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";

/**
 * Service pour récupérer les annonces similaires
 */
export const getSimilarAds = async (
  currentAdId: string, 
  category: string, 
  region: string, 
  limit: number = 6
): Promise<Ad[]> => {
  try {
    console.log(`Fetching similar ads for ad ${currentAdId}, category: ${category}, region: ${region}`);
    
    // Récupérer les annonces similaires avec les critères de priorité
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .eq('category', category)
      .neq('id', currentAdId)
      .order('ad_type', { ascending: false }) // Premium d'abord
      .order('created_at', { ascending: false }) // Plus récentes ensuite
      .limit(limit);

    if (error) {
      console.error('Error fetching similar ads:', error);
      return [];
    }

    // Ajouter l'image principale pour chaque annonce
    const adsWithImages = await Promise.all(
      (data || []).map(async (ad) => {
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

    console.log(`Found ${adsWithImages.length} similar ads with images`);
    return adsWithImages;
  } catch (error) {
    console.error('Error in getSimilarAds:', error);
    return [];
  }
};

/**
 * Récupérer les annonces similaires avec fallback par région si peu de résultats
 */
export const getSimilarAdsWithFallback = async (
  currentAdId: string,
  category: string,
  region: string,
  limit: number = 6
): Promise<Ad[]> => {
  try {
    // Première tentative avec la même région
    let similarAds = await getSimilarAds(currentAdId, category, region, limit);
    
    // Si on a moins de 3 résultats, élargir la recherche à toutes les régions
    if (similarAds.length < 3) {
      console.log(`Only ${similarAds.length} ads found, expanding search to all regions`);
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'approved')
        .eq('category', category)
        .neq('id', currentAdId)
        .order('ad_type', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching similar ads with fallback:', error);
        return similarAds;
      }

      // Ajouter l'image principale pour chaque annonce
      const adsWithImages = await Promise.all(
        (data || []).map(async (ad) => {
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

      similarAds = adsWithImages;
      console.log(`Found ${similarAds.length} ads with expanded search`);
    }
    
    return similarAds;
  } catch (error) {
    console.error('Error in getSimilarAdsWithFallback:', error);
    return [];
  }
};