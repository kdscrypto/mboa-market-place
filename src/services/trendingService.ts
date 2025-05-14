
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";
import { isValidImageUrl } from "@/services/homeService";

// Fonction pour récupérer les annonces premium
export const fetchPremiumAds = async (limit: number = 5): Promise<Ad[]> => {
  try {
    console.log("Fetching premium ads");
    
    // Récupérer les annonces premium (tout type sauf standard) sans vérifier l'authentification
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
      return []; // Retourner un tableau vide en cas d'erreur
    }
    
    if (!ads || ads.length === 0) {
      console.log("No premium ads found");
      return [];
    }
    
    // Pour chaque annonce, récupérer l'image principale
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
          
          // Vérifier si l'URL de l'image est valide
          let imageUrl = '/placeholder.svg';
          
          if (images && images.length > 0) {
            // Vérifier si l'URL est définie et non vide
            if (images[0].image_url && images[0].image_url.trim() !== '') {
              if (isValidImageUrl(images[0].image_url)) {
                imageUrl = images[0].image_url;
              } else {
                console.warn(`Invalid image URL format for ad ${ad.id}:`, images[0].image_url);
              }
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
