
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/utils/inputSanitization";
import { sendAdRejectionNotification } from "../messaging/notificationService";
import { validateAdServiceAuth } from "./adAuthService";

/**
 * Service pour mettre à jour le statut des annonces
 */
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
    await validateAdServiceAuth();
    
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
    throw error;
  }
};
