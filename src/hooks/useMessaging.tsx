import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from '@/services/messaging/types';
import { fetchUserConversations } from '@/services/messaging/conversationService';
import { fetchConversationMessages, sendMessage, markMessagesAsRead } from '@/services/messaging/messageService';
import { toast } from "sonner";

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Charger les conversations de l'utilisateur
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conversationsData = await fetchUserConversations();
      setConversations(conversationsData);
      
      // Calculer le nombre total de messages non lus
      const total = conversationsData.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
      setTotalUnread(total);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
      setError("Impossible de charger vos conversations");
      toast.error("Impossible de charger vos conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) {
      console.error("ID de conversation manquant");
      return;
    }
    
    setMessagesLoading(true);
    setError(null);
    try {
      console.log("Chargement des messages pour la conversation:", conversationId);
      const messagesData = await fetchConversationMessages(conversationId);
      console.log("Messages récupérés:", messagesData.length);
      setMessages(messagesData);
      setCurrentConversation(conversationId);
      
      // Marquer les messages comme lus
      await markMessagesAsRead(conversationId);
      
      // Mettre à jour le compteur de messages non lus dans la liste des conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
      
      // Recalculer le total des messages non lus
      setTotalUnread(prev => {
        const conversationUnreadCount = conversations.find(c => c.id === conversationId)?.unread_count || 0;
        return Math.max(0, prev - conversationUnreadCount);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError("Impossible de charger les messages");
      toast.error("Impossible de charger les messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [conversations]);

  // Envoyer un message
  const handleSendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      const { success, error } = await sendMessage(conversationId, content);
      
      if (!success) {
        toast.error(error || "Échec de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Impossible d'envoyer le message");
    }
  }, []);

  // Configurer l'écoute en temps réel pour les changements de messages
  useEffect(() => {
    if (!currentConversation) return;

    console.log("Configuration du canal pour la conversation:", currentConversation);

    // Canal pour les nouveaux messages dans la conversation actuelle
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation}`
        },
        (payload) => {
          console.log("Nouveau message reçu:", payload);
          // Ajouter le nouveau message à la liste
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Si le message n'est pas de l'utilisateur actuel, le marquer comme lu
          const checkAndMarkAsRead = async () => {
            const { data } = await supabase.auth.getSession();
            if (data && data.session && data.session.user.id !== newMessage.sender_id) {
              markMessagesAsRead(currentConversation);
            }
          };
          
          checkAndMarkAsRead();
        }
      )
      .subscribe();

    return () => {
      console.log("Suppression du canal pour la conversation");
      supabase.removeChannel(messagesChannel);
    };
  }, [currentConversation]);

  // Configurer l'écoute en temps réel pour les nouvelles conversations
  useEffect(() => {
    console.log("Configuration des canaux pour les conversations");
    
    // Canal pour les nouvelles conversations
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log("Changement détecté dans les conversations");
          // Recharger les conversations lorsqu'une nouvelle est créée ou modifiée
          loadConversations();
        }
      )
      .subscribe();

    // Canal pour tous les nouveaux messages (pour mettre à jour les compteurs non lus)
    const allMessagesChannel = supabase
      .channel('all-messages-changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log("Nouveau message détecté:", payload);
          const newMessage = payload.new as Message;
          const { data } = await supabase.auth.getUser();
          
          // Si ce n'est pas la conversation actuelle et ce n'est pas un message de l'utilisateur actuel
          if (newMessage.conversation_id !== currentConversation && newMessage.sender_id !== data?.user?.id) {
            console.log("Message dans une autre conversation, mise à jour des compteurs");
            // Recharger les conversations pour mettre à jour les compteurs
            loadConversations();
            
            // Notification de nouveau message
            const conversationInfo = conversations.find(c => c.id === newMessage.conversation_id);
            if (conversationInfo) {
              toast.info("Nouveau message", {
                description: `Nouveau message concernant l'annonce "${conversationInfo.ad_title}"`,
                action: {
                  label: "Voir",
                  onClick: () => loadMessages(newMessage.conversation_id)
                }
              });
            }
          }
        }
      )
      .subscribe();

    // Charger les conversations au démarrage
    loadConversations();

    return () => {
      console.log("Suppression des canaux de conversation");
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(allMessagesChannel);
    };
  }, [loadConversations, loadMessages, conversations, currentConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    totalUnread,
    error,
    loadConversations,
    loadMessages,
    sendMessage: handleSendMessage
  };
};
