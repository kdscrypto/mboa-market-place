
import React from "react";
import MessageForm from "../MessageForm";

interface ConversationEmptyStateProps {
  emptyState?: React.ReactNode;
  onSendMessage: (message: string, attachment?: { file: File; type: string }) => Promise<void>;
}

const ConversationEmptyState: React.FC<ConversationEmptyStateProps> = ({
  emptyState,
  onSendMessage
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col justify-center items-center">
        {emptyState}
      </div>
      <MessageForm onSendMessage={onSendMessage} />
    </div>
  );
};

export default ConversationEmptyState;
