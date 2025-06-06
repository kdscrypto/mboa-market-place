
import { useState, useCallback } from 'react';

export const useMessagingState = () => {
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  const selectConversation = useCallback((conversationId: string) => {
    console.log(`[MESSAGING STATE DEBUG] Selecting conversation: ${conversationId}`);
    setCurrentConversation(conversationId);
  }, []);

  const clearConversation = useCallback(() => {
    console.log(`[MESSAGING STATE DEBUG] Clearing current conversation`);
    setCurrentConversation(null);
  }, []);

  return {
    currentConversation,
    selectConversation,
    clearConversation
  };
};
