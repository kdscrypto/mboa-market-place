
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from '@/services/messaging/types';
import { fetchUserConversations } from '@/services/messaging/conversationService';
import { toast } from "sonner";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Load user conversations
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const conversationsData = await fetchUserConversations();
      setConversations(conversationsData);
      
      // Calculate total unread messages
      const total = conversationsData.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
      setTotalUnread(total);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
      setError("Impossible de charger vos conversations");
      toast.error("Impossible de charger vos conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update conversation's unread count
  const updateConversationUnreadCount = useCallback((conversationId: string, unreadCount: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: unreadCount } : conv
      )
    );
    
    // Recalculate total unread count
    setTotalUnread(prev => {
      const oldCount = conversations.find(c => c.id === conversationId)?.unread_count || 0;
      return Math.max(0, prev - oldCount + unreadCount);
    });
  }, [conversations]);

  // Setup realtime listening for conversations changes
  useEffect(() => {
    console.log("Configuration des canaux pour les conversations");
    
    // Channel for conversation changes
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log("Changement détecté dans les conversations");
          loadConversations();
        }
      )
      .subscribe();

    // Load conversations on mount
    loadConversations();

    return () => {
      console.log("Suppression du canal des conversations");
      supabase.removeChannel(conversationsChannel);
    };
  }, [loadConversations]);

  return {
    conversations,
    loading,
    totalUnread,
    error,
    loadConversations,
    updateConversationUnreadCount,
    setConversations
  };
};
