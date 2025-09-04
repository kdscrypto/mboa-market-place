
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
          
          if (imageError) {
            console.error(`Error retrieving images for ad ${ad.id}:`, imageError);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: ad.ad_type !== 'standard', // Consider all types except standard as premium
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
          };
          }
          
          // Check if image URL is valid
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
              
              // Test if the image can be loaded
              try {
                const response = await fetch(originalUrl, { method: 'HEAD' });
                if (!response.ok) {
                  console.warn(`Image URL returns ${response.status} for ad ${ad.id}:`, originalUrl);
                  imageUrl = '/placeholder.svg';
                }
              } catch (err) {
                console.warn(`Failed to validate image URL for ad ${ad.id}:`, err);
              }
            } else {
              console.warn(`Invalid image URL format for ad ${ad.id}:`, originalUrl);
            }
          } else {
            console.warn(`No image found for ad ${ad.id}`);
          }
          
          return {
            ...ad,
            imageUrl,
            is_premium: ad.ad_type !== 'standard', // Consider all types except standard as premium
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: ad.ad_type !== 'standard',
            phone: '', // Not exposed in public API for security
            user_id: '', // Not exposed in public API for security
            whatsapp: '' // Not exposed in public API for security
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
