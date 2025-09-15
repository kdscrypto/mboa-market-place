
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
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--messaging-main-bg)' }}>
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
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--messaging-surface)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--messaging-text-muted)' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--messaging-text-primary)' }}>
              Commencer une conversation
            </h3>
            <p style={{ color: 'var(--messaging-text-secondary)' }}>
              Sélectionnez une conversation pour démarrer la discussion
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesMainArea;
