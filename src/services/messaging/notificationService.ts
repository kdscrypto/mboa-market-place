
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "./types";

/**
 * Envoie une notification système à un utilisateur concernant le rejet de son annonce
 * @param userId ID de l'utilisateur à notifier
 * @param adId ID de l'annonce rejetée
 * @param adTitle Titre de l'annonce rejetée
 * @param rejectReason Raison du rejet de l'annonce
 * @returns Un booléen indiquant si l'envoi a réussi
 */
export const sendAdRejectionNotification = async (
  userId: string,
  adId: string,
  adTitle: string,
  rejectReason: string
): Promise<boolean> => {
  try {
    console.log(`Sending rejection notification for ad ${adId} to user ${userId}`);
    
    // Créer une conversation système pour la notification
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        ad_id: adId,
        seller_id: userId,
        buyer_id: userId, // Dans ce cas spécial, l'utilisateur est à la fois vendeur et acheteur pour une notification système
        status: 'system_notification'
      })
      .select('id')
      .single();
    
    if (convError || !conversation) {
      console.error("Error creating notification conversation:", convError);
      return false;
    }
    
    // Créer le message de notification
    const messageContent = `Votre annonce "${adTitle}" a été rejetée par notre équipe de modération.\n\nRaison: ${rejectReason}\n\nVous pouvez modifier votre annonce et la soumettre à nouveau.`;
    
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: userId, // Le système est considéré comme l'expéditeur pour une meilleure UX
        content: messageContent,
        is_system_message: true
      });
    
    if (msgError) {
      console.error("Error creating rejection message:", msgError);
      return false;
    }
    
    console.log("Rejection notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending rejection notification:", error);
    return false;
  }
};
