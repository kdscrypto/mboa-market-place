
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";

// Helper function to validate image URLs
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  try {
    // Check if URL is valid (starts with http://, https://, or is a relative path)
    const isValidPattern = url.startsWith('http://') || 
                           url.startsWith('https://') || 
                           url.startsWith('/');
    
    // Try to construct a URL object to further validate (will throw for malformed URLs)
    if (isValidPattern && (url.startsWith('http://') || url.startsWith('https://'))) {
      new URL(url);
    }
    
    return isValidPattern;
  } catch (e) {
    console.error("Invalid URL format:", url, e);
    return false;
  }
};

// Function to retrieve premium ads
export const fetchPremiumAds = async (limit: number = 5): Promise<Ad[]> => {
  try {
    console.log("Fetching premium ads");
    
    // Fetch premium ads (any type except standard)
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'approved')
      .not('ad_type', 'eq', 'standard')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error retrieving premium ads:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces premium",
        variant: "destructive",
      });
      return []; // Return empty array on error
    }
    
    if (!ads || ads.length === 0) {
      console.log("No premium ads found");
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
              is_premium: true
            };
          }
          
          // Check if image URL is valid
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            
            if (isValidImageUrl(originalUrl)) {
              // For Supabase storage URLs, ensure we have proper CORS access
              if (originalUrl.includes('supabase.co/storage/v1/object/public')) {
                // Add a random query parameter to bypass cache issues on some browsers
                const cacheBuster = `?t=${Date.now()}`;
                imageUrl = originalUrl + cacheBuster;
              } else {
                imageUrl = originalUrl;
              }
            } else {
              console.warn(`Invalid image URL format for ad ${ad.id}:`, originalUrl);
            }
          }
          
          return {
            ...ad,
            imageUrl,
            is_premium: true
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg',
            is_premium: true
          };
        }
      })
    );
    
    console.log(`Successfully loaded ${adsWithImages.length} premium ads`);
    return adsWithImages;
  } catch (error) {
    console.error("Error fetching premium ads:", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les annonces premium",
      variant: "destructive",
    });
    return [];
  }
};
