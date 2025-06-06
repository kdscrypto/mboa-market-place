
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { markMessagesAsDelivered } from "@/services/messaging/messageService";

export const useConversationEffects = (
  conversationId?: string,
  messagesCount: number = 0
) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data && data.user) {
          setCurrentUserId(data.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Mark messages as delivered when conversation is viewed
  useEffect(() => {
    if (conversationId && messagesCount > 0) {
      markMessagesAsDelivered(conversationId);
    }
  }, [conversationId, messagesCount]);

  // Simulate typing indicator (in real implementation, this would come from realtime)
  useEffect(() => {
    if (messagesCount > 0) {
      const randomInterval = Math.random() * 10000 + 5000; // 5-15 seconds
      const timeout = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000); // Show for 2 seconds
      }, randomInterval);

      return () => clearTimeout(timeout);
    }
  }, [messagesCount]);

  return {
    currentUserId,
    isTyping
  };
};
