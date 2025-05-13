
export interface Conversation {
  id: string;
  ad_id: string;
  seller_id: string;
  buyer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  is_system_message?: boolean;
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
