
import React, { useState, useCallback } from "react";
import { useMessaging } from "@/hooks/useMessaging";
import { useNotificationSettings } from "@/hooks/messaging/useNotificationSettings";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import ConversationSearch from "./ConversationSearch";
import EnhancedNotifications from "./EnhancedNotifications";
import MessagesEmptyState from "./MessagesEmptyState";
import MessagesErrorState from "./MessagesErrorState";
import { Conversation } from "@/services/messaging/types";
import { Loader2Icon } from "lucide-react";

const MessagesContent: React.FC = () => {
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    totalUnread,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    retryLoadMessages
  } = useMessaging();

  const {
    soundEnabled,
    notificationsEnabled,
    toggleSound,
    toggleNotifications,
    playNotificationSound,
    showDesktopNotification
  } = useNotificationSettings();

  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations);

  // Update filtered conversations when conversations change
  React.useEffect(() => {
    setFilteredConversations(conversations);
  }, [conversations]);

  const handleConversationSelect = useCallback((conversationId: string) => {
    loadMessages(conversationId);
  }, [loadMessages]);

  const handleSendMessage = useCallback(async (message: string, attachment?: { file: File; type: string }) => {
    if (currentConversation) {
      await sendMessage(currentConversation, message, attachment);
      
      // Play notification sound for sent message
      if (soundEnabled) {
        playNotificationSound();
      }
    }
  }, [currentConversation, sendMessage, soundEnabled, playNotificationSound]);

  const handleFilteredConversations = useCallback((filtered: Conversation[]) => {
    setFilteredConversations(filtered);
  }, []);

  // Get current conversation details
  const currentConversationData = conversations.find(c => c.id === currentConversation);

  if (loading) {
    return (
      <div className="flex h-[70vh] bg-white rounded-lg shadow-sm border items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2Icon className="h-10 w-10 animate-spin text-mboa-orange" />
          <p className="mt-3 text-sm text-gray-500">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <MessagesErrorState error={error} onRetry={loadConversations} />;
  }

  return (
    <div className="flex h-[70vh] bg-white rounded-lg shadow-sm border">
      {/* Sidebar with conversations */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        
        <EnhancedNotifications
          unreadCount={totalUnread}
          soundEnabled={soundEnabled}
          notificationsEnabled={notificationsEnabled}
          onToggleSound={toggleSound}
          onToggleNotifications={toggleNotifications}
        />
        
        <ConversationSearch
          conversations={conversations}
          onFilteredConversations={handleFilteredConversations}
        />
        
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={filteredConversations}
            currentConversation={currentConversation}
            onSelectConversation={handleConversationSelect}
            loading={loading}
          />
        </div>
      </div>

      {/* Main conversation area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <ConversationView
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={messagesLoading}
            adTitle={currentConversationData?.ad_title}
            error={error}
            onRetry={retryLoadMessages}
            conversationId={currentConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à échanger
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesContent;
