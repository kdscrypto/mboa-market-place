
import { supabase } from "@/integrations/supabase/client";

// Archive/Unarchive conversation
export const toggleConversationArchive = async (
  conversationId: string, 
  archived: boolean
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        archived,
        archived_at: archived ? new Date().toISOString() : null
      })
      .eq('id', conversationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Pin/Unpin conversation
export const toggleConversationPin = async (
  conversationId: string, 
  pinned: boolean
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ 
        pinned,
        pinned_at: pinned ? new Date().toISOString() : null
      })
      .eq('id', conversationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Add label to conversation
export const addConversationLabel = async (
  conversationId: string,
  labelName: string,
  labelColor: string = '#3B82F6'
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('conversation_labels')
      .insert({
        conversation_id: conversationId,
        label_name: labelName,
        label_color: labelColor,
        user_id: userData.user.id
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Remove label from conversation
export const removeConversationLabel = async (
  labelId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('conversation_labels')
      .delete()
      .eq('id', labelId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get conversation labels
export const getConversationLabels = async (
  conversationId: string
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('conversation_labels')
      .select('*')
      .eq('conversation_id', conversationId);

    if (error) {
      console.error("Erreur lors de la récupération des étiquettes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des étiquettes:", error);
    return [];
  }
};

// Report message
export const reportMessage = async (
  messageId: string,
  reason: string,
  description?: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const { error } = await supabase
      .from('message_reports')
      .insert({
        message_id: messageId,
        reported_by: userData.user.id,
        reason,
        description
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
