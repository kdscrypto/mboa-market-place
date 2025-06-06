
import React from "react";
import { Conversation } from "@/services/messaging/types";
import ConversationList from "../ConversationList";
import ConversationSearch from "../ConversationSearch";
import EnhancedNotifications from "../EnhancedNotifications";

interface MessagesSidebarProps {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  currentConversation: string | null;
  totalUnread: number;
  loading: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onToggleSound: () => void;
  onToggleNotifications: () => void;
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
  return (
    <div className="w-1/3 border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <EnhancedNotifications
        unreadCount={totalUnread}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={onToggleSound}
        onToggleNotifications={onToggleNotifications}
      />
      
      <ConversationSearch
        conversations={conversations}
        onFilteredConversations={onFilteredConversations}
      />
      
      <div className="flex-1 overflow-hidden">
        <ConversationList
          conversations={filteredConversations}
          currentConversation={currentConversation}
          onSelectConversation={onSelectConversation}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MessagesSidebar;
