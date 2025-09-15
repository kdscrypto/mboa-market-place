
import React, { useState } from "react";
import { Conversation } from "@/services/messaging/types";
import ConversationList from "../ConversationList";
import ConversationSearch from "../ConversationSearch";
import ConversationFilters from "../ConversationFilters";
import EnhancedNotifications from "../EnhancedNotifications";

interface MessagesSidebarProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  currentConversation: string | null;
  totalUnread: number;
  loading: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onToggleNotifications: (enabled: boolean) => void;
  onSelectConversation: (conversationId: string) => void;
  onFilteredConversations: (filtered: Conversation[]) => void;
}

const MessagesSidebar: React.FC<MessagesSidebarProps> = ({
  conversations,
  filteredConversations,
  currentConversation,
  totalUnread,
  loading,
  soundEnabled,
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications,
  onSelectConversation,
  onFilteredConversations
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'archived' | 'pinned'>('all');

  // Calculate conversation counts
  const counts = {
    all: conversations.filter(conv => !conv.archived).length,
    archived: conversations.filter(conv => conv.archived).length,
    pinned: conversations.filter(conv => conv.pinned && !conv.archived).length,
  };

  // Apply filters to conversations
  const getFilteredConversations = () => {
    let filtered = filteredConversations;
    
    switch (activeFilter) {
      case 'archived':
        filtered = filtered.filter(conv => conv.archived);
        break;
      case 'pinned':
        filtered = filtered.filter(conv => conv.pinned && !conv.archived);
        break;
      case 'all':
      default:
        filtered = filtered.filter(conv => !conv.archived);
        break;
    }
    
    // Sort: pinned conversations first, then by last_message_at
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });
  };

  const displayConversations = getFilteredConversations();

  return (
    <div className="w-1/3 border-r flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <div className="flex-shrink-0 p-3">
        <EnhancedNotifications
          unreadCount={totalUnread}
          soundEnabled={soundEnabled}
          notificationsEnabled={notificationsEnabled}
          onToggleSound={onToggleSound}
          onToggleNotifications={onToggleNotifications}
        />
      </div>

      <div className="flex-shrink-0">
        <ConversationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>
      
      <div className="flex-shrink-0">
        <ConversationSearch
          conversations={conversations}
          onFilteredConversations={onFilteredConversations}
        />
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <ConversationList
          conversations={displayConversations}
          currentConversation={currentConversation}
          onSelectConversation={onSelectConversation}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MessagesSidebar;
