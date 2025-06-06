
import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@/services/messaging/types';
import { useMessageRealtime } from './useMessageRealtime';
import { useMessageLoader } from './useMessageLoader';

export const useConversationMessages = (
  conversationId: string | null,
  onMarkAsRead: (conversationId: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);
  
  const isMountedRef = useRef<boolean>(true);
  const currentConversationRef = useRef<string | null>(null);
  const hasLoadedRef = useRef<string | null>(null); // Track which conversation has been loaded

  const { loadMessages } = useMessageLoader(
    onMarkAsRead,
    setMessages,
    setLoading,
    setError,
    isMountedRef,
    currentConversationRef
  );

  const { setupRealtimeChannel, cleanupRealtimeChannel } = useMessageRealtime(
    conversationId,
    onMarkAsRead,
    setMessages,
    isMountedRef
  );

  // Setup component lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("[MSG DEBUG] Component unmounting, cleaning up");
      isMountedRef.current = false;
      currentConversationRef.current = null;
      hasLoadedRef.current = null;
    };
  }, []);

  // Handle conversation changes - simplified logic to prevent loops
  useEffect(() => {
    console.log(`[MSG DEBUG] useEffect triggered - conversationId: ${conversationId}`);
    
    if (!conversationId) {
      console.log("[MSG DEBUG] No conversation selected, clearing state");
      setMessages([]);
      setLoading(false);
      setError(null);
      currentConversationRef.current = null;
      hasLoadedRef.current = null;
      cleanupRealtimeChannel();
      setChannelSubscribed(false);
      return;
    }

    // Only load if this conversation hasn't been loaded yet or if it's a different conversation
    if (hasLoadedRef.current !== conversationId) {
      console.log(`[MSG DEBUG] Loading new conversation: ${conversationId}`);
      
      // Clean up previous subscription
      cleanupRealtimeChannel();
      setChannelSubscribed(false);
      
      // Setup new subscription
      setupRealtimeChannel(conversationId);
      setChannelSubscribed(true);
      
      // Load messages
      console.log(`[MSG DEBUG] Triggering loadMessages for conversation: ${conversationId}`);
      loadMessages(conversationId);
      
      // Mark as loaded
      hasLoadedRef.current = conversationId;
    } else {
      console.log(`[MSG DEBUG] Conversation already loaded: ${conversationId}`);
    }

    return () => {
      console.log(`[MSG DEBUG] Cleanup for conversation: ${conversationId}`);
      cleanupRealtimeChannel();
    };
  }, [conversationId]); // Only depend on conversationId, not on functions

  const retryLoading = useCallback(() => {
    console.log(`[MSG DEBUG] Retry requested for conversation: ${conversationId}`);
    if (conversationId) {
      setError(null);
      hasLoadedRef.current = null; // Reset loaded state to force reload
      loadMessages(conversationId);
      hasLoadedRef.current = conversationId;
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
