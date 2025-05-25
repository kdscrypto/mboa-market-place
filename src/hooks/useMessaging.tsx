
import { useState, useCallback, useEffect } from 'react';
import { useConversations } from './messaging/useConversations';
import { useConversationMessages } from './messaging/useConversationMessages';
import { useMessageNotifications } from './messaging/useMessageNotifications';
import { useSendMessage } from './messaging/useSendMessage';

export const useMessaging = () => {
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  
  const {
    conversations,
    loading,
    totalUnread,
    error: conversationsError,
    loadConversations,
    updateConversationUnreadCount
  } = useConversations();

  const handleMarkAsRead = useCallback((conversationId: string) => {
    updateConversationUnreadCount(conversationId, 0);
  }, [updateConversationUnreadCount]);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    loadMessages: loadMessagesInternal,
    retryLoading
  } = useConversationMessages(currentConversation, handleMarkAsRead);

  // Enhanced load messages handler with proper error handling
  const loadMessages = useCallback((conversationId: string) => {
    try {
      if (!conversationId) {
        console.error("ID de conversation manquant");
        return;
      }
      
      console.log("Sélection de la conversation:", conversationId);
      setCurrentConversation(conversationId);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  }, []);

  // Enhanced retry functionality
  const retryLoadMessages = useCallback(() => {
    if (retryLoading) {
      retryLoading();
    } else if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation, loadMessages, retryLoading]);

  const { sendMessage } = useSendMessage();

  // Setup notifications for new messages
  useMessageNotifications(
    conversations,
    currentConversation,
    loadConversations,
    loadMessages
  );

  // Determine the final error state to show
  const error = messagesError || conversationsError;

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
    sendMessage,
    retryLoadMessages
  };
};
