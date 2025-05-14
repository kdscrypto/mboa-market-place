
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import { isValidImageUrl } from "@/services/trendingService";

// Function to retrieve approved ads
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Retrieve the most recent approved ads without checking authentication
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
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
              is_premium: ad.ad_type !== 'standard' // Consider all types except standard as premium
            };
          }
          
          // Check if image URL is valid
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            
            if (isValidImageUrl(originalUrl)) {
              // For Supabase storage URLs, ensure proper formatting
              if (originalUrl.includes('supabase.co/storage/v1/object/public')) {
                imageUrl = originalUrl;
              } else {
                imageUrl = originalUrl;
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
            is_premium: ad.ad_type !== 'standard' // Consider all types except standard as premium
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: ad.ad_type !== 'standard'
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
