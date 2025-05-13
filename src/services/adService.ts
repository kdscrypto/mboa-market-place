import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { sendAdRejectionNotification } from "./messaging/notificationService";

// Fonction pour récupérer toutes les annonces avec leurs images principales
export const fetchAdsWithStatus = async (status: string): Promise<Ad[]> => {
  try {
    console.log(`Fetching ads with status: ${status}`);
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.error("No active session found");
      throw new Error("Not authenticated");
    }
    
    // Fetch all ads with the specified status, without filtering by user_id
    // The RLS policies will handle access control based on user role
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error retrieving ads with status ${status}:`, error);
      throw error;
    }
    
    console.log(`${status} ads retrieved:`, ads?.length || 0);
    
    // Pour chaque annonce, récupérer l'image principale
    const adsWithImages = await Promise.all(
      (ads || []).map(async (ad) => {
        try {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          if (imageError) {
            console.error(`Error retrieving images for ad ${ad.id}:`, imageError);
          }
          
          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return {
            ...ad,
            imageUrl: '/placeholder.svg'
          };
        }
      })
    );
    
    return adsWithImages;
  } catch (error) {
    console.error(`Error retrieving ads with status ${status}:`, error);
    return [];
  }
};

// Fonction pour mettre à jour le statut d'une annonce avec vérification d'authentification
export const updateAdStatus = async (
  adId: string, 
  status: 'approved' | 'rejected', 
  rejectMessage?: string
): Promise<boolean> => {
  try {
    console.log(`Updating ad ${adId} to status: ${status}`);
    
    // Check authentication before proceeding
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Authentication error:", sessionError || "No active session");
      throw new Error("Authentication required");
    }
    
    // Récupérer les détails de l'annonce pour obtenir user_id et title
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('user_id, title')
      .eq('id', adId)
      .single();
    
    if (adError || !ad) {
      console.error(`Error fetching ad ${adId}:`, adError);
      return false;
    }
    
    // Préparer les données à mettre à jour
    const updateData: any = { status };
    
    // Ajouter le message de rejet si fourni
    if (status === 'rejected' && rejectMessage) {
      updateData.reject_reason = rejectMessage;
    }
    
    // Let Row Level Security handle permission checks
    const { error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', adId);
    
    if (error) {
      console.error(`Error updating ad ${adId}:`, error);
      if (error.code === 'PGRST116') {
        throw new Error("Permission denied: You don't have the required privileges");
      }
      throw error;
    }
    
    // Si l'annonce est rejetée et qu'un message est fourni, envoyer une notification
    if (status === 'rejected' && rejectMessage && ad.user_id) {
      await sendAdRejectionNotification(ad.user_id, adId, ad.title, rejectMessage);
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ad ${adId} to ${status}:`, error);
    return false;
  }
};
