
import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/services/messaging/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MessageStatus from "./MessageStatus";
import AttachmentPreview from "./AttachmentPreview";
import MessageReactions from "./MessageReactions";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  currentUserId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isSender,
  currentUserId,
  onAddReaction,
  onRemoveReaction
}) => {
  const formattedTime = format(new Date(message.created_at), "HH:mm", { locale: fr });

  const hasAttachment = message.attachment_url && message.attachment_name && message.attachment_type;

  const handleAddReaction = (messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    // TODO: Implement real reaction storage
    onAddReaction?.(messageId, emoji);
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
    // TODO: Implement real reaction removal
    onRemoveReaction?.(messageId, emoji);
  };

  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {!isSender && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="theme-bg-elevated theme-text-primary">
            A
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[80%]">
        <div
          className={cn(
            "rounded-lg px-4 py-2 shadow-sm",
            isSender 
              ? "bg-mboa-orange text-white rounded-br-none" 
              : "theme-bg-surface theme-border border theme-text-primary rounded-bl-none"
          )}
        >
          {/* Message content */}
          {message.content && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {/* Attachment preview */}
          {hasAttachment && (
            <AttachmentPreview
              attachmentUrl={message.attachment_url!}
              attachmentName={message.attachment_name!}
              attachmentType={message.attachment_type!}
              attachmentSize={message.attachment_size}
            />
          )}

          {/* Time and status */}
          <div className="flex items-center justify-between mt-1 gap-2">
            <p 
              className={cn(
                "text-xs",
                isSender ? "text-white/80" : "theme-text-secondary"
              )}
            >
              {formattedTime}
            </p>
            
            {isSender && (
              <MessageStatus 
                status={message.status}
                className={cn(
                  "text-white/80"
                )}
              />
            )}
          </div>
        </div>

        {/* Message reactions */}
        {currentUserId && (onAddReaction || onRemoveReaction) && (
          <MessageReactions
            messageId={message.id}
            reactions={undefined} // TODO: Add reactions to message type
            currentUserId={currentUserId}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
          />
        )}
      </div>

      {isSender && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="bg-mboa-orange text-white">
            M
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
