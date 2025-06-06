
import { useCallback } from 'react';
import { useConversations } from './messaging/useConversations';
import { useConversationMessages } from './messaging/useConversationMessages';
import { useMessagingState } from './messaging/useMessagingState';
import { useMessagingActions } from './messaging/useMessagingActions';
import { useMessagingIntegration } from './messaging/useMessagingIntegration';

export const useMessaging = () => {
  const { currentConversation, selectConversation } = useMessagingState();
  
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
    retryLoading
  } = useConversationMessages(currentConversation, handleMarkAsRead);

  // Simplified load messages handler - just select conversation
  const loadMessages = useCallback((conversationId: string) => {
    try {
      if (!conversationId) {
        console.error("[MESSAGING DEBUG] No conversation ID provided to loadMessages");
        return;
      }
      
      console.log(`[MESSAGING DEBUG] loadMessages called with: ${conversationId}`);
      selectConversation(conversationId);
    } catch (error) {
      console.error("[MESSAGING DEBUG] Error in loadMessages:", error);
    }
  }, [selectConversation]);

  // Enhanced retry functionality
  const retryLoadMessages = useCallback(() => {
    console.log(`[MESSAGING DEBUG] retryLoadMessages called`);
    
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

  const { sendMessage } = useMessagingActions(currentConversation);

  // Setup messaging integration
  useMessagingIntegration(
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
