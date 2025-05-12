
import { useState, useCallback } from 'react';
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
    loadMessages: loadMessagesInternal
  } = useConversationMessages(currentConversation, handleMarkAsRead);

  const loadMessages = useCallback((conversationId: string) => {
    setCurrentConversation(conversationId);
    loadMessagesInternal(conversationId);
  }, [loadMessagesInternal]);

  const { sendMessage } = useSendMessage();

  // Setup notifications for new messages
  useMessageNotifications(
    conversations,
    currentConversation,
    loadConversations,
    loadMessages
  );

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    totalUnread,
    error: messagesError || conversationsError,
    loadConversations,
    loadMessages,
    sendMessage
  };
};
