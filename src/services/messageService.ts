
import { supabase } from "@/integrations/supabase/client";

// Types pour les conversations et messages
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  ad_title?: string;
  ad_image?: string;
  other_user_id?: string;
  other_user_email?: string;
  unread_count?: number;
}

// Récupérer les conversations d'un utilisateur
export const fetchUserConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      console.error("Utilisateur non authentifié");
      return [];
    }
    
    const currentUserId = userData.user.id;
    
    // Récupérer les conversations où l'utilisateur est acheteur ou vendeur
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, ad_id(id, title)')
      .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      return [];
    }

    if (!conversations || conversations.length === 0) {
      console.log("Aucune conversation trouvée");
      return [];
    }

    console.log("Conversations récupérées:", conversations.length);

    // Enrichir les conversations avec des informations supplémentaires
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        // Récupérer le nombre de messages non lus
        const { count: unreadCount, error: countError } = await supabase
          .from('messages')
          .select('id', { count: "exact" })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .not('sender_id', 'eq', currentUserId);

        if (countError) {
          console.error("Erreur lors du comptage des messages non lus:", countError);
        }

        // Récupérer l'image de l'annonce
        const { data: adImages, error: imgError } = await supabase
          .from('ad_images')
          .select('image_url')
          .eq('ad_id', conv.ad_id.id)
          .order('position', { ascending: true })
          .limit(1);

        if (imgError) {
          console.error("Erreur lors de la récupération de l'image:", imgError);
        }

        // Déterminer l'autre utilisateur (acheteur ou vendeur)
        const otherUserId = conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;

        // Enrichir la conversation avec les données récupérées
        return {
          ...conv,
          ad_title: conv.ad_id.title,
          ad_image: adImages && adImages.length > 0 ? adImages[0].image_url : '/placeholder.svg',
          unread_count: unreadCount || 0,
          other_user_id: otherUserId
        };
      })
    );

    return enhancedConversations;
  } catch (error) {
    console.error("Erreur lors du traitement des conversations:", error);
    return [];
  }
};

// Récupérer les messages d'une conversation
export const fetchConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData || !userData.user) {
      console.error("Utilisateur non authentifié");
      return [];
    }
    
    // Vérifier que l'utilisateur a accès à cette conversation
    const { data: conversationCheck, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${userData.user.id},seller_id.eq.${userData.user.id}`)
      .eq('id', conversationId)
      .single();
    
    if (checkError || !conversationCheck) {
      console.error("Accès non autorisé à cette conversation:", checkError);
      return [];
    }
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      return [];
    }
    
    console.log("Messages récupérés:", messages?.length || 0);
    return messages || [];
  } catch (error) {
    console.error("Erreur lors du traitement des messages:", error);
    return [];
  }
};

// Créer une conversation entre acheteur et vendeur
export const createConversation = async (
  adId: string,
  sellerId: string,
  initialMessage: string
): Promise<{ conversation: Conversation | null; error: string | null }> => {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data || !data.user) {
      return { conversation: null, error: "Utilisateur non authentifié" };
    }

    const buyerId = data.user.id;

    // Vérifier si une conversation existe déjà pour cette annonce et cet acheteur
    const { data: existingConv, error: existingError } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_id', adId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .maybeSingle();

    if (existingError) {
      console.error("Erreur lors de la vérification des conversations existantes:", existingError);
    }

    // Si une conversation existe déjà, retourner son ID
    if (existingConv) {
      console.log("Conversation existante trouvée, ajout du message");
      // Ajouter le message à la conversation existante
      await sendMessage(existingConv.id, initialMessage);
      
      return { 
        conversation: { 
          id: existingConv.id, 
          ad_id: adId,
          buyer_id: buyerId,
          seller_id: sellerId,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        }, 
        error: null 
      };
    }

    console.log("Création d'une nouvelle conversation");
    // Créer une nouvelle conversation
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        ad_id: adId,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: 'active',
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.error("Erreur lors de la création de la conversation:", convError);
      return { conversation: null, error: "Erreur lors de la création de la conversation" };
    }

    // Envoyer le message initial
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: newConversation.id,
        sender_id: buyerId,
        content: initialMessage
      });

    if (msgError) {
      console.error("Erreur lors de l'envoi du message:", msgError);
      return { conversation: newConversation, error: "La conversation a été créée mais le message n'a pas pu être envoyé" };
    }

    return { conversation: newConversation, error: null };
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return { conversation: null, error: "Une erreur s'est produite" };
  }
};

// Envoyer un message dans une conversation
export const sendMessage = async (conversationId: string, content: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data } = await supabase.auth.getUser();
    
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
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data } = await supabase.auth.getUser();
    
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
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    return { success: false, error: "Une erreur s'est produite" };
  }
};
