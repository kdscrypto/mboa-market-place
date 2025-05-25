
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
    console.log(`[MESSAGING DEBUG] Marking conversation as read: ${conversationId}`);
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
        console.error("[MESSAGING DEBUG] No conversation ID provided to loadMessages");
        return;
      }
      
      console.log(`[MESSAGING DEBUG] loadMessages called with: ${conversationId}`);
      console.log(`[MESSAGING DEBUG] Current conversation: ${currentConversation}`);
      
      if (currentConversation === conversationId) {
        console.log(`[MESSAGING DEBUG] Same conversation already selected, skipping: ${conversationId}`);
        return;
      }
      
      console.log(`[MESSAGING DEBUG] Setting current conversation to: ${conversationId}`);
      setCurrentConversation(conversationId);
    } catch (error) {
      console.error("[MESSAGING DEBUG] Error in loadMessages:", error);
    }
  }, [currentConversation]);

  // Enhanced retry functionality
  const retryLoadMessages = useCallback(() => {
    console.log(`[MESSAGING DEBUG] retryLoadMessages called`);
    console.log(`[MESSAGING DEBUG] Current conversation: ${currentConversation}`);
    console.log(`[MESSAGING DEBUG] retryLoading function available: ${!!retryLoading}`);
    
    if (retryLoading) {
      console.log(`[MESSAGING DEBUG] Calling retryLoading function`);
      retryLoading();
    } else if (currentConversation) {
      console.log(`[MESSAGING DEBUG] Calling loadMessages for retry`);
      loadMessages(currentConversation);
    } else {
      console.log(`[MESSAGING DEBUG] No current conversation or retry function available`);
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

  // Debug logging for state changes
  useEffect(() => {
    console.log(`[MESSAGING DEBUG] State update:`, {
      currentConversation,
      messagesCount: messages.length,
      messagesLoading,
      messagesError,
      conversationsError
    });
  }, [currentConversation, messages.length, messagesLoading, messagesError, conversationsError]);

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
