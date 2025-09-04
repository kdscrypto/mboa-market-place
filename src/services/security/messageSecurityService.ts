import { supabase } from '@/integrations/supabase/client';

/**
 * Securely mark a message as read using database security function
 */
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('mark_message_read_secure', {
      p_message_id: messageId
    });

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Exception marking message as read:', error);
    return false;
  }
};

/**
 * Update message content (sender only)
 */
export const updateMessageContent = async (
  messageId: string, 
  content: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message content:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating message content:', error);
    return false;
  }
};