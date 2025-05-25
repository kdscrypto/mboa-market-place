
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

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (id: string) => {
    if (!id) {
      console.error("ID de conversation manquant");
      setLoading(false);
      return;
    }
    
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    setLoading(true);
    setError(null);
    
    // Set a timeout to stop loading after 10 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.error("Timeout lors du chargement des messages");
        setLoading(false);
        setError("Délai d'attente dépassé lors du chargement des messages");
      }
    }, 10000);
    
    try {
      console.log(`Chargement des messages pour la conversation: ${id}`);
      const messagesData = await fetchConversationMessages(id);
      console.log(`Messages récupérés:`, messagesData.length);
      
      // Clear timeout on success
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Ensure component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      if (messagesData && Array.isArray(messagesData)) {
        setMessages(messagesData);
        setError(null);
        
        // Mark messages as read
        try {
          await markMessagesAsRead(id);
          onMarkAsRead(id);
        } catch (markError) {
          console.error("Erreur lors du marquage des messages:", markError);
          // Non-critical error, don't display to user
        }
      } else {
        console.error("Format de messages invalide:", messagesData);
        setError("Format de messages invalide");
      }
    } catch (error: any) {
      // Clear timeout on error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Only update if component still mounted
      if (!isMountedRef.current) return;
      
      console.error("Erreur lors du chargement des messages:", error);
      const errorMessage = error?.message || "Impossible de charger les messages";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Always stop loading if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [onMarkAsRead]);

  // Setup realtime listening for new messages in this conversation
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear messages when conversation changes
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Clear previous channel if exists
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
      setChannelSubscribed(false);
    }

    const setupChannel = () => {
      console.log("Configuration du canal pour la conversation:", conversationId);

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
            if (!isMountedRef.current) return;
            
            console.log("Nouveau message reçu:", payload);
            const newMessage = payload.new as Message;
            
            // Update messages safely
            setMessages(prev => {
              // Check if message already exists (avoid duplicates)
              const messageExists = prev.some(msg => msg.id === newMessage.id);
              if (messageExists) return prev;
              
              return [...prev, newMessage];
            });
            
            // If the message is not from current user, mark as read
            const checkAndMarkAsRead = async () => {
              try {
                const { data } = await supabase.auth.getUser();
                if (data && data.user && data.user.id !== newMessage.sender_id) {
                  await markMessagesAsRead(conversationId);
                  onMarkAsRead(conversationId);
                }
              } catch (error) {
                console.error("Erreur lors du marquage des messages:", error);
              }
            };
            
            checkAndMarkAsRead();
          }
        )
        .subscribe((status) => {
          if (!isMountedRef.current) return;
          
          console.log("Status de la souscription aux messages:", status);
          setChannelSubscribed(status === "SUBSCRIBED");
        });
    };

    setupChannel();

    // Load messages when conversation changes
    loadMessages(conversationId);

    return () => {
      console.log("Suppression du canal pour la conversation");
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
    };
  }, [conversationId, loadMessages, onMarkAsRead]);

  // Retry loading function
  const retryLoading = useCallback(() => {
    if (conversationId) {
      setError(null);
      loadMessages(conversationId);
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
