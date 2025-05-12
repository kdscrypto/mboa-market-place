
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const UnreadBadge: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Récupérer le nombre de messages non lus
  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Récupérer toutes les conversations de l'utilisateur
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
        
      if (convError || !conversations) {
        console.error("Erreur lors de la récupération des conversations:", convError);
        setLoading(false);
        return;
      }
      
      if (conversations.length === 0) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      
      // Récupérer le nombre de messages non lus dans toutes les conversations
      const conversationIds = conversations.map(c => c.id);
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .in('conversation_id', conversationIds)
        .eq('read', false)
        .not('sender_id', 'eq', user.id);
        
      if (countError) {
        console.error("Erreur lors du comptage des messages non lus:", countError);
      } else {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages non lus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // S'abonner aux nouveaux messages
    const channel = supabase
      .channel('unread-messages-counter')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        },
        async () => {
          await fetchUnreadCount();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages',
          filter: 'read=eq.true'
        },
        async () => {
          await fetchUnreadCount();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <Link to="/messages">
      <Badge className="bg-mboa-orange text-white ml-1">
        {unreadCount}
      </Badge>
    </Link>
  );
};

export default UnreadBadge;
