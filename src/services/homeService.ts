
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import { isValidImageUrl } from "@/services/trendingService";

// Function to retrieve approved ads
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Use secure function to get homepage ads (no sensitive data exposed)
    const { data: ads, error } = await supabase
      .rpc('get_homepage_ads', { p_limit: limit });
    
    if (error) {
      console.error("Error retrieving approved ads:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces récentes",
        variant: "destructive",
      });
      return []; // Return empty array on error
    }
    
    if (!ads || ads.length === 0) {
      console.log("No approved ads found");
      return [];
    }
    
    // For each ad, retrieve the main image with time slicing to avoid blocking
    const { processWithYielding } = await import('@/utils/timeSlicing');
    
    const adsWithImages = await processWithYielding(
      ads,
      async (ad) => {
        try {
          // Utiliser la nouvelle fonction sécurisée pour obtenir l'image primaire
          const { data: imageUrlData, error: imageError } = await supabase
            .rpc('get_ad_primary_image', { p_ad_id: ad.id });
          
          let imageUrl = '/placeholder.svg';
          
          if (!imageError && imageUrlData) {
            imageUrl = imageUrlData;
            console.log(`Ad ${ad.id}: Using database image: ${imageUrl}`);
          } else {
            console.log(`Ad ${ad.id}: Error getting image:`, imageError);
          }
          
          return {
            ...ad,
            imageUrl,
            is_premium: ad.ad_type !== 'standard',
            phone: '',
            user_id: '',
            whatsapp: ''
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: ad.ad_type !== 'standard',
            phone: '',
            user_id: '',
            whatsapp: ''
          };
        }
      },
      3 // Process 3 ads at a time to avoid long tasks
    );
    
    console.log(`Successfully loaded ${adsWithImages.length} approved ads`);
    return adsWithImages;
  } catch (error) {
    console.error("Error fetching approved ads:", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les annonces récentes",
      variant: "destructive",
    });
    return []; // Return empty array on error
  }
};
