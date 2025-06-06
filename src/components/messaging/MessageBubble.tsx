
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageReactions from "./MessageReactions";
import MessageStatus from "./MessageStatus";
import MessageReportDialog from "./MessageReportDialog";

interface MessageBubbleProps {
  message: any;
  isSender: boolean;
  currentUserId?: string;
  showTimestamp?: boolean;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  currentUserId,
  showTimestamp = false,
  onAddReaction,
  onRemoveReaction
}) => {
  const [showReportDialog, setShowReportDialog] = useState(false);

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm", { locale: fr });
  };

  return (
    <>
      <div className={cn(
        "flex mb-4",
        isSender ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 relative group",
          isSender 
            ? "bg-mboa-orange text-white" 
            : "bg-gray-100 text-gray-900"
        )}>
          {/* Message actions dropdown */}
          {!isSender && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/20"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Signaler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Message content */}
          <div className="pr-6">
            {message.message_type === 'image' && message.attachment_url ? (
              <div className="mb-2">
                <img 
                  src={message.attachment_url} 
                  alt="Pièce jointe" 
                  className="max-w-full h-auto rounded-md"
                />
              </div>
            ) : message.message_type === 'document' && message.attachment_url ? (
              <div className="mb-2 p-2 bg-white/10 rounded-md">
                <a 
                  href={message.attachment_url} 
                  download={message.attachment_name}
                  className="text-blue-500 hover:underline"
                >
                  📎 {message.attachment_name || 'Document'}
                </a>
              </div>
            ) : null}
            
            <p className="text-sm">{message.content}</p>
          </div>

          {/* Message reactions */}
          {currentUserId && (
            <MessageReactions 
              messageId={message.id}
              reactions={message.reactions}
              currentUserId={currentUserId}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
            />
          )}

          {/* Timestamp and status */}
          <div className={cn(
            "flex items-center justify-between mt-1 text-xs",
            isSender ? "text-white/70" : "text-gray-500"
          )}>
            <span>{formatTime(message.created_at)}</span>
            {isSender && <MessageStatus status={message.status} />}
          </div>

          {showTimestamp && (
            <div className="text-xs text-gray-400 mt-1">
              {format(new Date(message.created_at), "PPP à HH:mm", { locale: fr })}
            </div>
          )}
        </div>
      </div>

      <MessageReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        messageId={message.id}
      />
    </>
  );
};

export default MessageBubble;
