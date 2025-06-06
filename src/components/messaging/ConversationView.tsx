
import React, { useState, useEffect, useRef } from "react";
import { Message } from "@/services/messaging/types";
import MessageForm from "./MessageForm";
import ConversationHeader from "./conversation/ConversationHeader";
import MessagesList from "./conversation/MessagesList";
import ConversationEmptyState from "./conversation/ConversationEmptyState";
import ConversationLoadingState from "./conversation/ConversationLoadingState";
import ConversationErrorState from "./conversation/ConversationErrorState";
import { useConversationEffects } from "./conversation/hooks/useConversationEffects";
import { useMessageActions } from "./conversation/hooks/useMessageActions";

interface ConversationViewProps {
  messages: Message[];
  onSendMessage: (message: string, attachment?: { file: File; type: string }) => Promise<void>;
  loading?: boolean;
  adTitle?: string;
  emptyState?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
  conversationId?: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  onSendMessage,
  loading = false,
  adTitle,
  emptyState,
  error = null,
  onRetry,
  conversationId
}) => {
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  
  const { currentUserId, isTyping } = useConversationEffects(
    conversationId, 
    loadedMessages.length
  );
  
  const { handleAddReaction, handleRemoveReaction } = useMessageActions();

  // Make sure to preserve loaded messages even when props.messages is temporarily empty
  useEffect(() => {
    if (messages && messages.length > 0) {
      console.log("Updating loaded messages with new messages:", messages.length);
      setLoadedMessages(messages);
    }
  }, [messages, loading, error]);

  // Handle error state first
  if (error) {
    return (
      <ConversationErrorState 
        error={error} 
        onRetry={onRetry} 
      />
    );
  }

  if (loading) {
    return <ConversationLoadingState />;
  }

  // If no messages and empty state is provided
  if (loadedMessages.length === 0 && messages.length === 0 && emptyState) {
    return (
      <ConversationEmptyState 
        emptyState={emptyState}
        onSendMessage={onSendMessage}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader adTitle={adTitle} />
      
      <MessagesList
        messages={loadedMessages}
        currentUserId={currentUserId || undefined}
        isTyping={isTyping}
        onAddReaction={handleAddReaction}
        onRemoveReaction={handleRemoveReaction}
      />

      <MessageForm onSendMessage={onSendMessage} />
    </div>
  );
};

export default ConversationView;
