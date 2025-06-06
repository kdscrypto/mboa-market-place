
import React, { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMessaging } from "@/hooks/useMessaging";
import ConversationList from "@/components/messaging/ConversationList";
import ConversationView from "@/components/messaging/ConversationView";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import MessagesErrorState from "./MessagesErrorState";
import MessagesEmptyState from "./MessagesEmptyState";

const MessagesContent: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [globalRetryCount, setGlobalRetryCount] = React.useState(0);
  
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    retryLoadMessages
  } = useMessaging();

  // Debug logging for state changes
  useEffect(() => {
    console.log(`[MESSAGES PAGE DEBUG] State update:`, {
      conversationId,
      currentConversation,
      messagesCount: messages.length,
      messagesLoading,
      error
    });
  }, [conversationId, currentConversation, messages.length, messagesLoading, error]);

  // Load selected conversation from URL
  useEffect(() => {
    if (conversationId) {
      console.log(`[MESSAGES PAGE DEBUG] Loading conversation from URL: ${conversationId}`);
      console.log(`[MESSAGES PAGE DEBUG] Current conversation: ${currentConversation}`);
      
      if (currentConversation !== conversationId) {
        console.log(`[MESSAGES PAGE DEBUG] Conversation changed, calling loadMessages`);
        loadMessages(conversationId);
      } else {
        console.log(`[MESSAGES PAGE DEBUG] Same conversation already loaded`);
      }
    } else {
      console.log(`[MESSAGES PAGE DEBUG] No conversationId in URL`);
    }
  }, [conversationId, loadMessages, currentConversation]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((id: string) => {
    console.log(`[MESSAGES PAGE DEBUG] Conversation selected: ${id}`);
    navigate(`/messages/${id}`);
  }, [navigate]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string): Promise<void> => {
    if (!currentConversation) {
      console.error("[MESSAGES PAGE DEBUG] No current conversation for sending message");
      toast.error("Aucune conversation sélectionnée");
      return;
    }
    
    try {
      console.log(`[MESSAGES PAGE DEBUG] Sending message to conversation: ${currentConversation}`);
      await sendMessage(currentConversation, content);
      console.log(`[MESSAGES PAGE DEBUG] Message sent successfully`);
    } catch (error) {
      console.error("[MESSAGES PAGE DEBUG] Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  }, [currentConversation, sendMessage]);

  // Global retry handler - increments counter to force full reload of dependencies
  const handleGlobalRetry = useCallback(() => {
    console.log(`[MESSAGES PAGE DEBUG] Global retry triggered`);
    setGlobalRetryCount(prev => prev + 1);
    loadConversations();
    
    if (currentConversation) {
      console.log(`[MESSAGES PAGE DEBUG] Retrying messages for current conversation: ${currentConversation}`);
      retryLoadMessages();
    }
  }, [currentConversation, loadConversations, retryLoadMessages]);

  // Get current conversation details
  const currentConversationDetails = conversations.find(
    conv => conv.id === currentConversation
  );

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b">Messagerie</h2>
      
      <div className="flex h-[600px] max-h-[70vh]">
        {/* Conversation list */}
        <div className="w-1/3 border-r">
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>
        
        {/* Conversation view */}
        <div className="w-2/3 flex flex-col">
          {error && !currentConversation && (
            <MessagesErrorState 
              error={error} 
              onRetry={handleGlobalRetry}
            />
          )}

          {!error && currentConversation ? (
            <ConversationView
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={messagesLoading}
              error={error}
              onRetry={handleGlobalRetry}
              adTitle={currentConversationDetails?.ad_title || "Conversation"}
              emptyState={
                <div className="text-center p-6">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium">Commencer la conversation</h3>
                  <p className="text-gray-500 mt-1">
                    Envoyez un message pour démarrer la conversation
                  </p>
                </div>
              }
            />
          ) : !error && (
            <MessagesEmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesContent;
