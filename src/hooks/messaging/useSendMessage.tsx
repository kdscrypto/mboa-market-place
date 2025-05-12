
import { useCallback } from 'react';
import { sendMessage as apiSendMessage } from '@/services/messaging/messageService';
import { toast } from "sonner";

export const useSendMessage = () => {
  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      const { success, error } = await apiSendMessage(conversationId, content);
      
      if (!success) {
        toast.error(error || "Échec de l'envoi du message");
      }
      return { success };
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Impossible d'envoyer le message");
      return { success: false };
    }
  }, []);

  return { sendMessage };
};
