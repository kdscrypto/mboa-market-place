
import React, { useEffect, useRef } from "react";
import { Message } from "@/services/messaging/types";
import MessageBubble from "../MessageBubble";
import TypingIndicator from "../TypingIndicator";

interface MessagesListProps {
  messages: Message[];
  currentUserId?: string;
  isTyping: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  isTyping,
  onAddReaction,
  onRemoveReaction
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Aucun message à afficher</p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto px-2 py-2 whatsapp-scrollbar" style={{ backgroundColor: 'var(--messaging-main-bg)' }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isSender={message.sender_id === currentUserId}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      ))}
      
      <TypingIndicator isTyping={isTyping} />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
