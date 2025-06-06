
import { useCallback } from 'react';
import { useSendMessage } from './useSendMessage';

export const useMessagingActions = (currentConversation: string | null) => {
  const { sendMessage: sendMessageInternal } = useSendMessage();

  const sendMessage = useCallback(async (
    message: string, 
    attachment?: { file: File; type: string }
  ) => {
    if (currentConversation) {
      return await sendMessageInternal(currentConversation, message, attachment);
    }
  }, [currentConversation, sendMessageInternal]);

  return {
    sendMessage
  };
};
