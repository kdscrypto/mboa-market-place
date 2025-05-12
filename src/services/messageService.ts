
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
    // Récupérer les conversations où l'utilisateur est acheteur ou vendeur
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, ad_id(id, title)')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des conversations:", error);
      return [];
    }

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Enrichir les conversations avec des informations supplémentaires
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        // Récupérer le nombre de messages non lus
        const { count: unreadCount, error: countError } = await supabase
          .from('messages')
          .select('id', { count: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .not('sender_id', 'eq', (await supabase.auth.getUser()).data.user?.id || '');

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
        const currentUserId = (await supabase.auth.getUser()).data.user?.id;
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
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      return [];
    }

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
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      return { conversation: null, error: "Utilisateur non authentifié" };
    }

    const buyerId = user.user.id;

    // Vérifier si une conversation existe déjà pour cette annonce et cet acheteur
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_id', adId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .maybeSingle();

    // Si une conversation existe déjà, retourner son ID
    if (existingConv) {
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

    // Créer une nouvelle conversation
    const { data: newConversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        ad_id: adId,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: 'active'
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
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.user.id,
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
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .not('sender_id', 'eq', user.user.id)
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
