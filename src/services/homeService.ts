import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import { isValidImageUrl } from "@/services/trendingService";

// Function to retrieve approved ads with optimized RLS handling
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Use a more specific query that works with our RLS policies
    // This query targets only approved ads and doesn't trigger user_profiles recursion
    const { data: ads, error } = await supabase
      .from('ads')
      .select(`
        id,
        title,
        description,
        category,
        region,
        city,
        price,
        phone,
        whatsapp,
        status,
        ad_type,
        premium_expires_at,
        created_at,
        updated_at,
        user_id
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error retrieving approved ads:", error);
      
      // Don't show toast for RLS errors - they're not user-facing issues
      if (!error.message?.includes('policy') && !error.message?.includes('recursion')) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces récentes",
          variant: "destructive",
        });
      }
      return [];
    }
    
    if (!ads || ads.length === 0) {
      console.log("No approved ads found");
      return [];
    }
    
    console.log(`Found ${ads.length} approved ads`);
    
    // For each ad, retrieve the main image with error handling
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
            console.warn(`Error retrieving images for ad ${ad.id}:`, imageError);
            return {
              ...ad,
              imageUrl: '/placeholder.svg',
              is_premium: ad.ad_type !== 'standard'
            };
          }
          
          // Check if image URL is valid and accessible
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0 && images[0].image_url) {
            const originalUrl = images[0].image_url.trim();
            
            if (isValidImageUrl(originalUrl)) {
              imageUrl = originalUrl;
              
              // Test if the image can be loaded (with timeout)
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch(originalUrl, { 
                  method: 'HEAD',
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                  console.warn(`Image URL returns ${response.status} for ad ${ad.id}:`, originalUrl);
                  imageUrl = '/placeholder.svg';
                }
              } catch (err) {
                console.warn(`Failed to validate image URL for ad ${ad.id}:`, err);
                // Keep the original URL even if validation fails - it might still work
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
            is_premium: ad.ad_type !== 'standard'
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
    
    console.log(`Successfully loaded ${adsWithImages.length} approved ads with images`);
    return adsWithImages;
  } catch (error) {
    console.error("Error fetching approved ads:", error);
    
    // Only show user-facing errors in toast
    if (error instanceof Error && !error.message?.includes('policy') && !error.message?.includes('recursion')) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces récentes",
        variant: "destructive",
      });
    }
    
    return [];
  }
};

// Function to check RLS health (for debugging)
export const checkRLSHealth = async (): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('check_rls_health');
    
    if (error) {
      console.error("Error checking RLS health:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to check RLS health:", error);
    return null;
  }
};
