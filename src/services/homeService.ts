
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
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          console.log(`Ad ${ad.id}: Found ${images?.length || 0} images`);
          
          let imageUrl = '/placeholder.svg';
          
          if (!imageError && images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
              console.log(`Ad ${ad.id}: Using database image`);
            }
          } else {
            // Use category-based fallback images from Unsplash
            const categoryImages: Record<string, string> = {
              '1': 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=400&h=400&fit=crop&auto=format&q=75', // Véhicules
              '4': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format&q=75', // Mode & Beauté
              '5': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&auto=format&q=75', // Services
              '15': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&auto=format&q=75', // High-tech
              'default': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format&q=75'
            };
            
            imageUrl = categoryImages[ad.category] || categoryImages['default'];
            console.log(`Ad ${ad.id}: Using category fallback image for category ${ad.category}`);
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
