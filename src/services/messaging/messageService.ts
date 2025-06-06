
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

// Récupérer les messages d'une conversation
export const fetchConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    console.log(`[SERVICE DEBUG] fetchConversationMessages starting for: ${conversationId}`);
    
    if (!conversationId || typeof conversationId !== 'string') {
      console.error("[SERVICE DEBUG] Invalid conversation ID:", conversationId);
      throw new Error("ID de conversation invalide");
    }
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("[SERVICE DEBUG] Auth error:", authError);
      throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
    }
    
    if (!userData || !userData.user) {
      console.error("[SERVICE DEBUG] No authenticated user");
      throw new Error("Vous devez être connecté pour accéder à cette conversation");
    }
    
    const currentUserId = userData.user.id;
    console.log(`[SERVICE DEBUG] Authenticated user: ${currentUserId}`);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    console.log(`[SERVICE DEBUG] Checking conversation access for user ${currentUserId} to conversation ${conversationId}`);
    
    const { data: conversationCheck, error: checkError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id')
      .eq('id', conversationId)
      .maybeSingle();
    
    if (checkError) {
      console.error("[SERVICE DEBUG] Conversation check error:", checkError);
      throw new Error("Erreur lors de la vérification de l'accès à la conversation");
    }
    
    if (!conversationCheck) {
      console.error("[SERVICE DEBUG] Conversation not found:", conversationId);
      throw new Error("Conversation non trouvée");
    }
    
    console.log(`[SERVICE DEBUG] Conversation found:`, conversationCheck);
    
    // Check if user is participant
    const isParticipant = conversationCheck.buyer_id === currentUserId || conversationCheck.seller_id === currentUserId;
    
    if (!isParticipant) {
      console.error(`[SERVICE DEBUG] User ${currentUserId} is not a participant in conversation ${conversationId}`);
      console.error(`[SERVICE DEBUG] Buyer: ${conversationCheck.buyer_id}, Seller: ${conversationCheck.seller_id}`);
      throw new Error("Vous n'avez pas accès à cette conversation");
    }
    
    console.log(`[SERVICE DEBUG] Access verified for user ${currentUserId} to conversation ${conversationId}`);
    
    // Une fois l'accès vérifié, récupérer les messages
    console.log(`[SERVICE DEBUG] Fetching messages for conversation: ${conversationId}`);
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("[SERVICE DEBUG] Messages fetch error:", error);
      throw new Error(`Impossible de récupérer les messages: ${error.message}`);
    }
    
    console.log(`[SERVICE DEBUG] Successfully fetched ${messages?.length || 0} messages for conversation ${conversationId}`);
    console.log(`[SERVICE DEBUG] Messages data:`, messages);
    
    // Garantir que nous renvoyons toujours un tableau
    const result = messages || [];
    console.log(`[SERVICE DEBUG] Returning ${result.length} messages`);
    return result;
  } catch (error: any) {
    console.error("[SERVICE DEBUG] fetchConversationMessages error:", error);
    console.error("[SERVICE DEBUG] Error stack:", error.stack);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// Upload attachment to storage
const uploadAttachment = async (file: File, conversationId: string): Promise<string> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error("Utilisateur non authentifié");
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${userData.user.id}/${conversationId}/${Date.now()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from('message_attachments')
    .upload(fileName, file);

  if (error) {
    console.error("Erreur lors de l'upload de la pièce jointe:", error);
    throw new Error("Erreur lors de l'upload de la pièce jointe");
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('message_attachments')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

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

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: "Erreur d'authentification" };
    }
    
    if (!data || !data.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .not('sender_id', 'eq', data.user.id)
      .eq('read', false);

    if (error) {
      console.error("Erreur lors du marquage des messages comme lus:", error);
      return { success: false, error: "Erreur lors du marquage des messages comme lus" };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};

// Marquer les messages comme delivered
export const markMessagesAsDelivered = async (conversationId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.rpc('mark_messages_as_delivered', {
      conversation_uuid: conversationId
    });

    if (error) {
      console.error("Erreur lors du marquage des messages comme delivered:", error);
      return { success: false, error: "Erreur lors du marquage des messages comme delivered" };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Erreur lors du marquage des messages comme delivered:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};
