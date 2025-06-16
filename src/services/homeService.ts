
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";

// Function to retrieve approved ads with optimized handling
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Simple query to fetch approved ads
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
      throw error;
    }
    
    if (!ads || ads.length === 0) {
      console.log("No approved ads found");
      return [];
    }
    
    console.log(`Found ${ads.length} approved ads`);
    
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
            imageUrl = images[0].image_url.trim();
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
    
    toast({
      title: "Erreur",
      description: "Impossible de charger les annonces récentes",
      variant: "destructive",
    });
    
    return [];
  }
};

// Simple health check function
export const checkRLSHealth = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('count(*)')
      .eq('status', 'approved')
      .limit(1);
    
    if (error) {
      console.error("Error checking RLS health:", error);
      return {
        rls_status: 'error',
        error_message: error.message,
        last_check: new Date().toISOString()
      };
    }
    
    return {
      rls_status: 'healthy',
      last_check: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to check RLS health:", error);
    return {
      rls_status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString()
    };
  }
};
