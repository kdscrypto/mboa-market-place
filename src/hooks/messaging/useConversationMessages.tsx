
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/services/messaging/types';
import { fetchConversationMessages, markMessagesAsRead } from '@/services/messaging/messageService';
import { toast } from "sonner";

export const useConversationMessages = (
  conversationId: string | null,
  onMarkAsRead: (conversationId: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (id: string) => {
    if (!id) {
      console.error("ID de conversation manquant");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log("Chargement des messages pour la conversation:", id);
      const messagesData = await fetchConversationMessages(id);
      console.log("Messages récupérés:", messagesData.length);
      setMessages(messagesData);
      
      // Mark messages as read
      await markMessagesAsRead(id);
      onMarkAsRead(id);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError("Impossible de charger les messages");
      toast.error("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, [onMarkAsRead]);

  // Setup realtime listening for new messages in this conversation
  useEffect(() => {
    if (!conversationId) return;

    console.log("Configuration du canal pour la conversation:", conversationId);

    // Channel for new messages in current conversation
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log("Nouveau message reçu:", payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // If the message is not from current user, mark as read
          const checkAndMarkAsRead = async () => {
            const { data } = await supabase.auth.getSession();
            if (data && data.session && data.session.user.id !== newMessage.sender_id) {
              markMessagesAsRead(conversationId);
            }
          };
          
          checkAndMarkAsRead();
        }
      )
      .subscribe();

    // Load messages when conversation changes
    if (conversationId) {
      loadMessages(conversationId);
    }

    return () => {
      console.log("Suppression du canal pour la conversation");
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages
  };
};
