
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

// Récupérer les messages d'une conversation
export const fetchConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    console.log("Début de fetchConversationMessages pour:", conversationId);
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Erreur d'authentification:", authError);
      throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
    }
    
    if (!userData || !userData.user) {
      console.error("Utilisateur non authentifié");
      throw new Error("Vous devez être connecté pour accéder à cette conversation");
    }
    
    const currentUserId = userData.user.id;
    console.log("Utilisateur authentifié:", currentUserId);
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const { data: conversationCheck, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
      .eq('id', conversationId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erreur lors de la vérification de la conversation:", checkError);
      throw new Error("Erreur lors de la vérification de l'accès à la conversation");
    }
    
    if (!conversationCheck) {
      console.error("Accès non autorisé à cette conversation");
      throw new Error("Vous n'avez pas accès à cette conversation");
    }
    
    console.log("Accès à la conversation vérifié");
    
    // Une fois l'accès vérifié, récupérer les messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw new Error(`Impossible de récupérer les messages: ${error.message}`);
    }
    
    console.log("Messages récupérés avec succès:", messages?.length || 0);
    
    // Garantir que nous renvoyons toujours un tableau
    return messages || [];
  } catch (error: any) {
    console.error("Erreur lors du traitement des messages:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

// Envoyer un message dans une conversation
export const sendMessage = async (conversationId: string, content: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: "Erreur d'authentification. Veuillez vous reconnecter." };
    }
    
    if (!data || !data.user) {
      return { success: false, error: "Utilisateur non authentifié" };
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
    
    // Envoi du message
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: data.user.id,
        content: content
      });

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
