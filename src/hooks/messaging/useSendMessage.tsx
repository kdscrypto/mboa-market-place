
import { useCallback } from 'react';
import { sendMessage as apiSendMessage } from '@/services/messaging/messageService';
import { toast } from "sonner";

export const useSendMessage = () => {
  // Send a message with optional attachment
  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    attachment?: { file: File; type: string }
  ): Promise<void> => {
    if (!content.trim() && !attachment) return;
    
    try {
      const { success, error } = await apiSendMessage(conversationId, content, attachment);
      
      if (!success) {
        toast.error(error || "Échec de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Impossible d'envoyer le message");
    }
  }, []);

  return { sendMessage };
};
