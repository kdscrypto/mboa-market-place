
import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/services/messaging/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSender }) => {
  const formattedTime = format(new Date(message.created_at), "HH:mm", { locale: fr });

  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {!isSender && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="bg-mboa-orange text-white">
            {isSender ? "V" : "A"}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
          isSender 
            ? "bg-mboa-orange text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p 
          className={cn(
            "text-xs mt-1 text-right",
            isSender ? "text-white/80" : "text-gray-500"
          )}
        >
          {formattedTime}
        </p>
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
