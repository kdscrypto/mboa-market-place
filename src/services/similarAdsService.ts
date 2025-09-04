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
    
    // Use secure function for similar ads
    const { data: allAds, error } = await supabase
      .rpc('get_public_ads_safe', { p_limit: 100, p_offset: 0 });
    
    if (error) {
      console.error('Error fetching similar ads:', error);
      return [];
    }
    
    // Filter for same category, excluding current ad
    const similarAds = (allAds || [])
      .filter(ad => ad.category === category && ad.id !== currentAdId)
      .sort((a, b) => {
        // Premium ads first
        const aIsPremium = a.ad_type !== 'standard';
        const bIsPremium = b.ad_type !== 'standard';
        
        if (aIsPremium && !bIsPremium) return -1;
        if (!aIsPremium && bIsPremium) return 1;
        
        // Then by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, limit);

    // Ajouter l'image principale pour chaque annonce
    const adsWithImages = await Promise.all(
      similarAds.map(async (ad) => {
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
            phone: '', // Hidden for public access
            whatsapp: '', // Hidden for public access
            user_id: '', // Hidden for public access
            reject_reason: undefined // Hidden for public access
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            phone: '', // Hidden for public access
            whatsapp: '', // Hidden for public access
            user_id: '', // Hidden for public access
            reject_reason: undefined // Hidden for public access
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
      
      // Use secure function for region-based similar ads  
      const { data: allAds, error } = await supabase
        .rpc('get_public_ads_safe', { p_limit: 100, p_offset: 0 });
      
      if (error) {
        console.error('Error fetching similar ads by region:', error);
        return similarAds;
      }
      
      // Filter for same category, excluding current ad (all regions)
      const expandedAds = (allAds || [])
        .filter(ad => ad.category === category && ad.id !== currentAdId)
        .sort((a, b) => {
          // Premium ads first
          const aIsPremium = a.ad_type !== 'standard';
          const bIsPremium = b.ad_type !== 'standard';
          
          if (aIsPremium && !bIsPremium) return -1;
          if (!aIsPremium && bIsPremium) return 1;
          
          // Then by creation date
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, limit);

      // Ajouter l'image principale pour chaque annonce
      const adsWithImages = await Promise.all(
        expandedAds.map(async (ad) => {
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
              phone: '', // Hidden for public access
              whatsapp: '', // Hidden for public access
              user_id: '', // Hidden for public access
              reject_reason: undefined // Hidden for public access
            };
          } catch (err) {
            console.error(`Error processing images for ad ${ad.id}:`, err);
            return {
              ...ad,
              imageUrl: '/placeholder.svg',
              phone: '', // Hidden for public access
              whatsapp: '', // Hidden for public access
              user_id: '', // Hidden for public access
              reject_reason: undefined // Hidden for public access
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