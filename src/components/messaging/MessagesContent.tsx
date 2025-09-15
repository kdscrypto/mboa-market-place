
import React from "react";
import { Loader2Icon } from "lucide-react";
import MessagesEmptyState from "./MessagesEmptyState";
import MessagesErrorState from "./MessagesErrorState";
import MessagesSidebar from "./content/MessagesSidebar";
import MessagesMainArea from "./content/MessagesMainArea";
import { useMessagesContentLogic } from "./content/useMessagesContentLogic";

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
    retryLoadMessages,
    filteredConversations,
    currentConversationData,
    soundEnabled,
    notificationsEnabled,
    toggleSound,
    toggleNotifications,
    handleConversationSelect,
    handleSendMessage,
    handleFilteredConversations
  } = useMessagesContentLogic();

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
      <MessagesSidebar
        conversations={conversations}
        filteredConversations={filteredConversations}
        currentConversation={currentConversation}
        totalUnread={totalUnread}
        loading={loading}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        onToggleSound={toggleSound}
        onToggleNotifications={toggleNotifications}
        onSelectConversation={handleConversationSelect}
        onFilteredConversations={handleFilteredConversations}
      />

      <MessagesMainArea
        currentConversation={currentConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        adTitle={currentConversationData?.ad_title}
        error={error}
        onSendMessage={handleSendMessage}
        onRetry={retryLoadMessages}
      />
    </div>
  );
};

export default MessagesContent;
