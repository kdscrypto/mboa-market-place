
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Conversation } from "@/services/messaging/types";
import { useMessaging } from "@/hooks/useMessaging";
import { useNotificationSettings } from "@/hooks/messaging/useNotificationSettings";

export const useMessagesContentLogic = () => {
  const messaging = useMessaging();
  const notifications = useNotificationSettings();
  const [searchParams] = useSearchParams();
  
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(messaging.conversations);

  // Update filtered conversations when conversations change
  useEffect(() => {
    setFilteredConversations(messaging.conversations);
  }, [messaging.conversations]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && messaging.conversations.length > 0) {
      // Check if the conversation exists in the user's conversations
      const conversationExists = messaging.conversations.some(conv => conv.id === conversationId);
      if (conversationExists && messaging.currentConversation !== conversationId) {
        console.log(`[MESSAGES] Auto-selecting conversation from URL: ${conversationId}`);
        messaging.loadMessages(conversationId);
      }
    }
  }, [searchParams, messaging.conversations, messaging.currentConversation, messaging.loadMessages]);

  const handleConversationSelect = useCallback((conversationId: string) => {
    messaging.loadMessages(conversationId);
  }, [messaging.loadMessages]);

  const handleSendMessage = useCallback(async (message: string, attachment?: { file: File; type: string }) => {
    if (messaging.currentConversation) {
      await messaging.sendMessage(message, attachment);
      
      // Play notification sound for sent message
      if (notifications.soundEnabled) {
        notifications.playNotificationSound();
      }
    }
  }, [messaging.currentConversation, messaging.sendMessage, notifications.soundEnabled, notifications.playNotificationSound]);

  const handleFilteredConversations = useCallback((filtered: Conversation[]) => {
    setFilteredConversations(filtered);
  }, []);

  // Get current conversation details
  const currentConversationData = messaging.conversations.find(c => c.id === messaging.currentConversation);

  return {
    ...messaging,
    ...notifications,
    filteredConversations,
    currentConversationData,
    handleConversationSelect,
    handleSendMessage,
    handleFilteredConversations
  };
};
