
import { useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message, Conversation } from '@/services/messaging/types';
import { toast } from "sonner";

export const useMessageNotifications = (
  conversations: Conversation[],
  currentConversationId: string | null,
  onNewMessage: () => void,
  onMessageInConversation: (conversationId: string) => void
) => {
  // Setup global message notifications
  useEffect(() => {
    console.log("Configuration du canal pour les notifications de messages");
    
    // Channel for all new messages (to update unread counters)
    const allMessagesChannel = supabase
      .channel('all-messages-changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log("Nouveau message détecté:", payload);
          const newMessage = payload.new as Message;
          const { data } = await supabase.auth.getUser();
          
          // If not in current conversation and not from the current user
          if (newMessage.conversation_id !== currentConversationId && 
              newMessage.sender_id !== data?.user?.id) {
            console.log("Message dans une autre conversation, mise à jour des compteurs");
            
            // Reload conversations to update counters
            onNewMessage();
            
            // Notification for new message
            const conversationInfo = conversations.find(c => c.id === newMessage.conversation_id);
            if (conversationInfo) {
              toast.info("Nouveau message", {
                description: `Nouveau message concernant l'annonce "${conversationInfo.ad_title}"`,
                action: {
                  label: "Voir",
                  onClick: () => onMessageInConversation(newMessage.conversation_id)
                }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Suppression du canal de notifications");
      supabase.removeChannel(allMessagesChannel);
    };
  }, [conversations, currentConversationId, onNewMessage, onMessageInConversation]);
};
