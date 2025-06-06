
import React from "react";
import { Message } from "@/services/messaging/types";
import ConversationView from "../ConversationView";

interface MessagesMainAreaProps {
  currentConversation: string | null;
  messages: Message[];
  messagesLoading: boolean;
  adTitle?: string;
  error?: string | null;
  onSendMessage: (message: string, attachment?: { file: File; type: string }) => Promise<void>;
  onRetry: () => void;
}

const MessagesMainArea: React.FC<MessagesMainAreaProps> = ({
  currentConversation,
  messages,
  messagesLoading,
  adTitle,
  error,
  onSendMessage,
  onRetry
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {currentConversation ? (
        <ConversationView
          messages={messages}
          onSendMessage={onSendMessage}
          loading={messagesLoading}
          adTitle={adTitle}
          error={error}
          onRetry={onRetry}
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
  );
};

export default MessagesMainArea;
