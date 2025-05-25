
import { useCallback, useRef } from 'react';
import { Message } from '@/services/messaging/types';
import { fetchConversationMessages, markMessagesAsRead } from '@/services/messaging/messageService';
import { toast } from "sonner";
import { useMessageLoadingTimeout } from './useMessageLoadingTimeout';

export const useMessageLoader = (
  onMarkAsRead: (conversationId: string) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  isMountedRef: React.MutableRefObject<boolean>,
  currentConversationRef: React.MutableRefObject<string | null>
) => {
  const { setLoadingTimeout, clearLoadingTimeout } = useMessageLoadingTimeout();
  
  const loadMessages = useCallback(async (id: string) => {
    if (!id) {
      console.log("[MSG DEBUG] No conversation ID provided, skipping load");
      setLoading(false);
      return;
    }
    
    console.log(`[MSG DEBUG] Starting loadMessages for conversation: ${id}`);
    currentConversationRef.current = id;
    
    setLoading(true);
    setError(null);
    setMessages([]);
    
    console.log(`[MSG DEBUG] Set loading=true for conversation: ${id}`);
    
    const handleTimeout = () => {
      if (isMountedRef.current && currentConversationRef.current === id) {
        setLoading(false);
        setError("Délai d'attente dépassé lors du chargement des messages");
      }
    };
    
    setLoadingTimeout(id, handleTimeout);
    
    try {
      console.log(`[MSG DEBUG] Calling fetchConversationMessages for: ${id}`);
      
      const messagesData = await fetchConversationMessages(id);
      
      console.log(`[MSG DEBUG] fetchConversationMessages returned:`, {
        conversationId: id,
        messageCount: messagesData?.length || 0,
        messages: messagesData
      });
      
      clearLoadingTimeout();
      
      if (!isMountedRef.current || currentConversationRef.current !== id) {
        console.log(`[MSG DEBUG] Component unmounted or conversation changed, skipping state update for: ${id}`);
        return;
      }
      
      if (messagesData && Array.isArray(messagesData)) {
        console.log(`[MSG DEBUG] Setting ${messagesData.length} messages for conversation: ${id}`);
        setMessages(messagesData);
        setError(null);
        
        try {
          await markMessagesAsRead(id);
          onMarkAsRead(id);
          console.log(`[MSG DEBUG] Messages marked as read for conversation: ${id}`);
        } catch (markError) {
          console.error(`[MSG DEBUG] Error marking messages as read for ${id}:`, markError);
        }
      } else {
        console.error(`[MSG DEBUG] Invalid messages format for ${id}:`, messagesData);
        setError("Format de messages invalide");
        setMessages([]);
      }
    } catch (error: any) {
      clearLoadingTimeout();
      
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
      if (isMountedRef.current && currentConversationRef.current === id) {
        console.log(`[MSG DEBUG] Setting loading=false for conversation: ${id}`);
        setLoading(false);
      }
    }
  }, [onMarkAsRead, setMessages, setLoading, setError, isMountedRef, currentConversationRef, setLoadingTimeout, clearLoadingTimeout]);
  
  return { loadMessages };
};
