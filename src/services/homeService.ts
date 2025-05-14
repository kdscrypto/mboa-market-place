
import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { toast } from "@/components/ui/use-toast";

// Fonction pour vérifier si une URL d'image est valide
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  // Vérifier si l'URL est valide (débute par http:// ou https:// ou est un chemin relatif commençant par /)
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// Fonction pour récupérer les annonces approuvées récentes
export const fetchApprovedAds = async (limit: number = 6): Promise<Ad[]> => {
  try {
    console.log("Fetching approved ads for homepage");
    
    // Récupérer les annonces approuvées les plus récentes sans vérifier l'authentification
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
      return []; // Retourner un tableau vide en cas d'erreur
    }
    
    if (!ads || ads.length === 0) {
      console.log("No approved ads found");
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
              is_premium: ad.ad_type !== 'standard' // Considérer tous les types sauf standard comme premium
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
            is_premium: ad.ad_type !== 'standard' // Considérer tous les types sauf standard comme premium
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
    return []; // Retourner un tableau vide en cas d'erreur
  }
};
