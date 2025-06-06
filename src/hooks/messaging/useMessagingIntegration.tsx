
import { useCallback, useEffect } from 'react';
import { useMessageNotifications } from './useMessageNotifications';

export const useMessagingIntegration = (
  conversations: any[],
  currentConversation: string | null,
  loadConversations: () => void,
  loadMessages: (conversationId: string) => void
) => {
  // Setup notifications for new messages
  useMessageNotifications(
    conversations,
    currentConversation,
    loadConversations,
    loadMessages
  );

  // Debug logging for state changes
  useEffect(() => {
    console.log(`[MESSAGING DEBUG] Integration state update:`, {
      currentConversation,
      conversationsCount: conversations.length
    });
  }, [currentConversation, conversations.length]);
};
