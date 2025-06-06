
import { supabase } from "@/integrations/supabase/client";
import { uploadAttachment } from "./attachmentService";

// Envoyer un message dans une conversation
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  attachment?: { file: File; type: string }
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: "Erreur d'authentification. Veuillez vous reconnecter." };
    }
    
    if (!data || !data.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    let attachmentUrl = null;
    let messageType = 'text';
    
    // Upload attachment if provided
    if (attachment) {
      try {
        attachmentUrl = await uploadAttachment(attachment.file, conversationId);
        messageType = attachment.type.startsWith('image/') ? 'image' : 'document';
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        return { success: false, error: "Erreur lors de l'upload de la pièce jointe" };
      }
    }

    // Mise à jour du last_message_at de la conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
      
    if (updateError) {
      console.error("Erreur lors de la mise à jour de la conversation:", updateError);
      return { success: false, error: "Erreur lors de la mise à jour de la conversation" };
    }
    
    // Préparer les données du message
    const messageData: any = {
      conversation_id: conversationId,
      sender_id: data.user.id,
      content: content,
      message_type: messageType,
      status: 'sent'
    };

    // Ajouter les données de pièce jointe si présente
    if (attachment && attachmentUrl) {
      messageData.attachment_url = attachmentUrl;
      messageData.attachment_name = attachment.file.name;
      messageData.attachment_size = attachment.file.size;
      messageData.attachment_type = attachment.type;
    }
    
    // Envoi du message
    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return { success: false, error: "Erreur lors de l'envoi du message" };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Erreur lors de l'envoi du message:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};
