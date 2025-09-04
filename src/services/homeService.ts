
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
    
    // For each ad, retrieve the main image
    const adsWithImages = await Promise.all(
      ads.map(async (ad) => {
        try {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          let imageUrl = '/placeholder.svg';
          
          if (!imageError && images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
            }
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
      })
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
