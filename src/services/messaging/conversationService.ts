
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "./types";
import { sendMessage } from "./messageService";

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
