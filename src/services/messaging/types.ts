
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
  // New advanced management properties
  archived?: boolean;
  pinned?: boolean;
  archived_at?: string;
  pinned_at?: string;
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
  // New moderation fields
  moderated?: boolean;
  moderation_reason?: string;
  moderated_by?: string;
  moderated_at?: string;
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

export interface ConversationLabel {
  id: string;
  conversation_id: string;
  label_name: string;
  label_color: string;
  created_at: string;
  user_id: string;
}

export interface SystemMessage {
  id: string;
  conversation_id: string;
  message_type: 'conversation_created' | 'user_joined' | 'user_left' | 'conversation_archived' | 'conversation_unarchived' | 'label_added' | 'label_removed';
  content: string;
  metadata: any;
  created_at: string;
}

export interface MessageReport {
  id: string;
  message_id: string;
  reported_by: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'scam' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}
