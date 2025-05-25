
import { useRef, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/services/messaging/types';
import { markMessagesAsRead } from '@/services/messaging/messageService';

export const useMessageRealtime = (
  conversationId: string | null,
  onMarkAsRead: (conversationId: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  isMountedRef: React.MutableRefObject<boolean>
) => {
  const messagesChannelRef = useRef<any>(null);
  
  const setupRealtimeChannel = useCallback((id: string) => {
    console.log(`[MSG DEBUG] Setting up realtime channel for conversation: ${id}`);

    const channelName = `messages-changes-${id}`;
    messagesChannelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${id}`
        },
        (payload) => {
          if (!isMountedRef.current) {
            console.log("[MSG DEBUG] Component unmounted, ignoring realtime message");
            return;
          }
          
          console.log(`[MSG DEBUG] New message received via realtime for ${id}:`, payload);
          const newMessage = payload.new as Message;
          
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              console.log(`[MSG DEBUG] Message ${newMessage.id} already exists, skipping`);
              return prev;
            }
            
            console.log(`[MSG DEBUG] Adding new message ${newMessage.id} to conversation ${id}`);
            return [...prev, newMessage];
          });
          
          // Auto-mark as read if message is not from current user
          const checkAndMarkAsRead = async () => {
            try {
              const { data } = await supabase.auth.getUser();
              if (data && data.user && data.user.id !== newMessage.sender_id) {
                await markMessagesAsRead(id);
                onMarkAsRead(id);
                console.log(`[MSG DEBUG] Auto-marked messages as read for ${id}`);
              }
            } catch (error) {
              console.error(`[MSG DEBUG] Error auto-marking messages as read for ${id}:`, error);
            }
          };
          
          checkAndMarkAsRead();
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        
        console.log(`[MSG DEBUG] Realtime subscription status for ${id}: ${status}`);
        
        if (status === "CHANNEL_ERROR") {
          console.error(`[MSG DEBUG] Realtime channel error for ${id}`);
        } else if (status === "TIMED_OUT") {
          console.error(`[MSG DEBUG] Realtime subscription timed out for ${id}`);
        } else if (status === "CLOSED") {
          console.log(`[MSG DEBUG] Realtime channel closed for ${id}`);
        }
      });
  }, [setMessages, onMarkAsRead, isMountedRef]);
  
  const cleanupRealtimeChannel = useCallback(() => {
    if (messagesChannelRef.current) {
      console.log(`[MSG DEBUG] Removing existing channel for conversation change`);
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRealtimeChannel();
    };
  }, [cleanupRealtimeChannel]);
  
  return {
    setupRealtimeChannel,
    cleanupRealtimeChannel
  };
};
