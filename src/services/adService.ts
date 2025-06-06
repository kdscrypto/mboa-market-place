import { supabase } from "@/integrations/supabase/client";
import { Ad } from "@/types/adTypes";
import { sendAdRejectionNotification } from "./messaging/notificationService";
import { sanitizeText } from "@/utils/inputSanitization";

// Fonction pour récupérer toutes les annonces avec leurs images principales
export const fetchAdsWithStatus = async (status: string): Promise<Ad[]> => {
  try {
    console.log(`Fetching ads with status: ${status}`);
    
    // Sanitize status input
    const sanitizedStatus = sanitizeText(status, 50);
    if (!['pending', 'approved', 'rejected'].includes(sanitizedStatus)) {
      throw new Error("Invalid status parameter");
    }
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw sessionError;
    }
    
    if (!session) {
      console.error("No active session found");
      throw new Error("Authentication required");
    }
    
    // Check if user has admin/moderator privileges
    const { data: hasAccess, error: accessError } = await supabase.rpc('is_admin_or_moderator');
    
    if (accessError) {
      console.error("Error checking access privileges:", accessError);
      throw new Error("Access verification failed");
    }
    
    if (!hasAccess) {
      console.error("User does not have required privileges");
      throw new Error("Insufficient privileges");
    }
    
    // Fetch ads with the specified status
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', sanitizedStatus)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error retrieving ads with status ${sanitizedStatus}:`, error);
      throw error;
    }
    
    console.log(`${sanitizedStatus} ads retrieved:`, ads?.length || 0);
    
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
    throw error; // Re-throw to let caller handle
  }
};

// Fonction pour mettre à jour le statut d'une annonce avec vérification d'authentification
export const updateAdStatus = async (
  adId: string, 
  status: 'approved' | 'rejected', 
  rejectMessage?: string
): Promise<boolean> => {
  try {
    console.log(`Updating ad ${adId} to status: ${status}`, rejectMessage ? `with message: ${rejectMessage}` : '');
    
    // Sanitize inputs
    const sanitizedAdId = sanitizeText(adId, 100);
    if (!sanitizedAdId || !/^[a-fA-F0-9-]{36}$/.test(sanitizedAdId)) {
      throw new Error("Invalid ad ID format");
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error("Invalid status value");
    }
    
    let sanitizedRejectMessage: string | undefined;
    if (rejectMessage) {
      sanitizedRejectMessage = sanitizeText(rejectMessage, 1000);
      if (!sanitizedRejectMessage.trim()) {
        throw new Error("Reject message cannot be empty");
      }
    }
    
    // Check authentication before proceeding
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Authentication error:", sessionError || "No active session");
      throw new Error("Authentication required");
    }
    
    // Check if user has admin/moderator privileges
    const { data: hasAccess, error: accessError } = await supabase.rpc('is_admin_or_moderator');
    
    if (accessError) {
      console.error("Error checking access privileges:", accessError);
      throw new Error("Access verification failed");
    }
    
    if (!hasAccess) {
      console.error("User does not have required privileges");
      throw new Error("Insufficient privileges");
    }
    
    // Récupérer les détails de l'annonce pour obtenir user_id et title
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('user_id, title')
      .eq('id', sanitizedAdId)
      .single();
    
    if (adError || !ad) {
      console.error(`Error fetching ad ${sanitizedAdId}:`, adError);
      throw new Error("Ad not found");
    }
    
    console.log("Ad details:", ad);
    
    // Préparer les données à mettre à jour
    const updateData: any = { status };
    
    // Ajouter le message de rejet si fourni
    if (status === 'rejected' && sanitizedRejectMessage) {
      updateData.reject_reason = sanitizedRejectMessage;
    }
    
    // Update the ad status
    const { error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', sanitizedAdId);
    
    if (error) {
      console.error(`Error updating ad ${sanitizedAdId}:`, error);
      throw error;
    }
    
    console.log(`Successfully updated ad ${sanitizedAdId} to ${status}`);
    
    // Si l'annonce est rejetée et qu'un message est fourni, envoyer une notification
    if (status === 'rejected' && sanitizedRejectMessage && ad.user_id) {
      console.log("Sending rejection notification...");
      try {
        const notificationSent = await sendAdRejectionNotification(ad.user_id, sanitizedAdId, ad.title, sanitizedRejectMessage);
        console.log("Notification sent:", notificationSent);
        
        if (!notificationSent) {
          console.error("Failed to send notification, but ad status was updated");
        }
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Continue even if notification fails, as the ad status was updated
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ad ${adId} to ${status}:`, error);
    throw error; // Re-throw to let caller handle
  }
};

// Fonction pour supprimer définitivement une annonce
export const deleteAd = async (adId: string): Promise<boolean> => {
  try {
    console.log(`Deleting ad: ${adId}`);
    
    // Sanitize input
    const sanitizedAdId = sanitizeText(adId, 100);
    if (!sanitizedAdId || !/^[a-fA-F0-9-]{36}$/.test(sanitizedAdId)) {
      throw new Error("Invalid ad ID format");
    }
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Authentication error:", sessionError || "No active session");
      throw new Error("Authentication required");
    }
    
    // Check if user has admin/moderator privileges
    const { data: hasAccess, error: accessError } = await supabase.rpc('is_admin_or_moderator');
    
    if (accessError) {
      console.error("Error checking access privileges:", accessError);
      throw new Error("Access verification failed");
    }
    
    if (!hasAccess) {
      console.error("User does not have required privileges");
      throw new Error("Insufficient privileges");
    }
    
    // First, delete associated images from storage and database
    const { data: images, error: imagesError } = await supabase
      .from('ad_images')
      .select('image_url')
      .eq('ad_id', sanitizedAdId);
    
    if (imagesError) {
      console.error("Error fetching ad images:", imagesError);
    }
    
    // Delete images from storage
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          // Extract file path from URL
          const urlParts = image.image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${sanitizedAdId}/${fileName}`;
          
          const { error: storageError } = await supabase.storage
            .from('ad_images')
            .remove([filePath]);
          
          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }
        } catch (err) {
          console.error("Error processing image deletion:", err);
        }
      }
    }
    
    // Delete image records from database
    const { error: deleteImagesError } = await supabase
      .from('ad_images')
      .delete()
      .eq('ad_id', sanitizedAdId);
    
    if (deleteImagesError) {
      console.error("Error deleting image records:", deleteImagesError);
    }
    
    // Delete conversations related to this ad
    const { error: deleteConversationsError } = await supabase
      .from('conversations')
      .delete()
      .eq('ad_id', sanitizedAdId);
    
    if (deleteConversationsError) {
      console.error("Error deleting conversations:", deleteConversationsError);
    }
    
    // Finally, delete the ad itself
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', sanitizedAdId);
    
    if (error) {
      console.error(`Error deleting ad ${sanitizedAdId}:`, error);
      throw error;
    }
    
    console.log(`Successfully deleted ad ${sanitizedAdId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting ad ${adId}:`, error);
    throw error;
  }
};
