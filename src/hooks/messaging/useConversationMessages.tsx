
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from '@/services/messaging/types';
import { fetchConversationMessages, markMessagesAsRead } from '@/services/messaging/messageService';
import { toast } from "sonner";

export const useConversationMessages = (
  conversationId: string | null,
  onMarkAsRead: (conversationId: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);
  const messagesChannelRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (id: string) => {
    if (!id) {
      console.log("[MSG DEBUG] No conversation ID provided, skipping load");
      setLoading(false);
      return;
    }
    
    console.log(`[MSG DEBUG] Starting loadMessages for conversation: ${id}`);
    console.log(`[MSG DEBUG] Current loading state: ${loading}`);
    console.log(`[MSG DEBUG] Component mounted: ${isMountedRef.current}`);
    
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      console.log("[MSG DEBUG] Clearing existing timeout");
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Update current conversation reference
    currentConversationRef.current = id;
    
    setLoading(true);
    setError(null);
    setMessages([]); // Clear previous messages immediately
    
    console.log(`[MSG DEBUG] Set loading=true for conversation: ${id}`);
    
    // Set a timeout to stop loading after 10 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && currentConversationRef.current === id) {
        console.error(`[MSG DEBUG] Timeout reached for conversation: ${id}`);
        setLoading(false);
        setError("Délai d'attente dépassé lors du chargement des messages");
        toast.error("Délai d'attente dépassé lors du chargement des messages");
      }
    }, 10000);
    
    try {
      console.log(`[MSG DEBUG] Calling fetchConversationMessages for: ${id}`);
      
      const messagesData = await fetchConversationMessages(id);
      
      console.log(`[MSG DEBUG] fetchConversationMessages returned:`, {
        conversationId: id,
        messageCount: messagesData?.length || 0,
        messages: messagesData
      });
      
      // Clear timeout on success
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Ensure component is still mounted and we're still loading the same conversation
      if (!isMountedRef.current) {
        console.log(`[MSG DEBUG] Component unmounted, skipping state update for: ${id}`);
        return;
      }
      
      if (currentConversationRef.current !== id) {
        console.log(`[MSG DEBUG] Conversation changed during load, skipping state update for: ${id}`);
        return;
      }
      
      if (messagesData && Array.isArray(messagesData)) {
        console.log(`[MSG DEBUG] Setting ${messagesData.length} messages for conversation: ${id}`);
        setMessages(messagesData);
        setError(null);
        
        // Mark messages as read
        try {
          await markMessagesAsRead(id);
          onMarkAsRead(id);
          console.log(`[MSG DEBUG] Messages marked as read for conversation: ${id}`);
        } catch (markError) {
          console.error(`[MSG DEBUG] Error marking messages as read for ${id}:`, markError);
          // Non-critical error, don't display to user
        }
      } else {
        console.error(`[MSG DEBUG] Invalid messages format for ${id}:`, messagesData);
        setError("Format de messages invalide");
        setMessages([]);
      }
    } catch (error: any) {
      // Clear timeout on error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Only update if component still mounted and same conversation
      if (!isMountedRef.current || currentConversationRef.current !== id) {
        console.log(`[MSG DEBUG] Component unmounted or conversation changed, skipping error handling for: ${id}`);
        return;
      }
      
      console.error(`[MSG DEBUG] Error loading messages for ${id}:`, error);
      const errorMessage = error?.message || "Impossible de charger les messages";
      setError(errorMessage);
      setMessages([]);
      toast.error(errorMessage);
    } finally {
      // Always stop loading if component is still mounted and same conversation
      if (isMountedRef.current && currentConversationRef.current === id) {
        console.log(`[MSG DEBUG] Setting loading=false for conversation: ${id}`);
        setLoading(false);
      } else {
        console.log(`[MSG DEBUG] Skipping loading=false due to unmount or conversation change for: ${id}`);
      }
    }
  }, [onMarkAsRead]);

  // Setup realtime listening for new messages in this conversation
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("[MSG DEBUG] Component unmounting, cleaning up");
      isMountedRef.current = false;
      currentConversationRef.current = null;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log(`[MSG DEBUG] useEffect triggered - conversationId: ${conversationId}`);
    
    // Clear messages when conversation changes
    if (!conversationId) {
      console.log("[MSG DEBUG] No conversation selected, clearing state");
      setMessages([]);
      setLoading(false);
      setError(null);
      currentConversationRef.current = null;
      return;
    }

    // Clear previous channel if exists
    if (messagesChannelRef.current) {
      console.log(`[MSG DEBUG] Removing existing channel for conversation change`);
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
      setChannelSubscribed(false);
    }

    const setupChannel = () => {
      console.log(`[MSG DEBUG] Setting up realtime channel for conversation: ${conversationId}`);

      // Channel for new messages in current conversation
      const channelName = `messages-changes-${conversationId}`;
      messagesChannelRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            if (!isMountedRef.current) {
              console.log("[MSG DEBUG] Component unmounted, ignoring realtime message");
              return;
            }
            
            console.log(`[MSG DEBUG] New message received via realtime for ${conversationId}:`, payload);
            const newMessage = payload.new as Message;
            
            // Update messages safely
            setMessages(prev => {
              // Check if message already exists (avoid duplicates)
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (messageExists) {
                console.log(`[MSG DEBUG] Message ${newMessage.id} already exists, skipping`);
                return prev;
              }
              
              console.log(`[MSG DEBUG] Adding new message ${newMessage.id} to conversation ${conversationId}`);
              return [...prev, newMessage];
            });
            
            // If the message is not from current user, mark as read
            const checkAndMarkAsRead = async () => {
              try {
                const { data } = await supabase.auth.getUser();
                if (data && data.user && data.user.id !== newMessage.sender_id) {
                  await markMessagesAsRead(conversationId);
                  onMarkAsRead(conversationId);
                  console.log(`[MSG DEBUG] Auto-marked messages as read for ${conversationId}`);
                }
              } catch (error) {
                console.error(`[MSG DEBUG] Error auto-marking messages as read for ${conversationId}:`, error);
              }
            };
            
            checkAndMarkAsRead();
          }
        )
        .subscribe((status) => {
          if (!isMountedRef.current) return;
          
          console.log(`[MSG DEBUG] Realtime subscription status for ${conversationId}: ${status}`);
          setChannelSubscribed(status === "SUBSCRIBED");
          
          if (status === "CHANNEL_ERROR") {
            console.error(`[MSG DEBUG] Realtime channel error for ${conversationId}`);
          } else if (status === "TIMED_OUT") {
            console.error(`[MSG DEBUG] Realtime subscription timed out for ${conversationId}`);
          } else if (status === "CLOSED") {
            console.log(`[MSG DEBUG] Realtime channel closed for ${conversationId}`);
          }
        });
    };

    setupChannel();

    // Load messages when conversation changes
    console.log(`[MSG DEBUG] Triggering loadMessages for conversation: ${conversationId}`);
    loadMessages(conversationId);

    return () => {
      console.log(`[MSG DEBUG] Cleanup for conversation: ${conversationId}`);
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [conversationId, loadMessages, onMarkAsRead]);

  // Retry loading function
  const retryLoading = useCallback(() => {
    console.log(`[MSG DEBUG] Retry requested for conversation: ${conversationId}`);
    if (conversationId) {
      setError(null);
      loadMessages(conversationId);
    } else {
      console.log("[MSG DEBUG] No conversation to retry");
    }
  }, [conversationId, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    channelSubscribed,
    retryLoading
  };
};
