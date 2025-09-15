
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
    <div className="w-1/3 flex flex-col h-full" style={{ backgroundColor: 'var(--messaging-sidebar-bg)', borderRight: '1px solid var(--messaging-border)' }}>
      {/* WhatsApp Header */}
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: 'var(--messaging-sidebar-bg)', borderBottom: '1px solid var(--messaging-border)' }}>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--messaging-text-primary)' }}>WhatsApp</h2>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--messaging-text-secondary)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="flex-shrink-0 px-4 py-2">
        <EnhancedNotifications
          unreadCount={totalUnread}
          soundEnabled={soundEnabled}
          notificationsEnabled={notificationsEnabled}
          onToggleSound={onToggleSound}
          onToggleNotifications={onToggleNotifications}
        />
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <ConversationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>
      
      {/* Search */}
      <div className="flex-shrink-0">
        <ConversationSearch
          conversations={conversations}
          onFilteredConversations={onFilteredConversations}
        />
      </div>
      
      {/* Conversations List */}
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
