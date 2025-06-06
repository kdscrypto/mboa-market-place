
export interface Conversation {
  id: string;
  ad_id: string;
  seller_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  // Extended properties added from the API/database
  ad_title?: string;
  ad_image?: string;
  unread_count?: number;
  other_user_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  is_system_message?: boolean;
  // New message status fields
  status: 'sent' | 'delivered' | 'read';
  delivered_at?: string | null;
  read_at?: string | null;
  // New attachment fields
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  attachment_type?: string | null;
}

export interface ConversationWithDetails extends Conversation {
  ad: {
    title: string;
    price: number;
    imageUrl?: string;
  };
  contact: {
    username?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}
