
// Types for the messaging system
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  ad_title?: string;
  ad_image?: string;
  other_user_id?: string;
  other_user_email?: string;
  unread_count?: number;
}
