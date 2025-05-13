
import React from "react";
import { Conversation } from "@/services/messaging/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  onSelectConversation,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex flex-col space-y-2 p-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Aucune conversation trouvée</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y overflow-auto">
      {conversations.map((conversation) => {
        const isActive = conversation.id === currentConversation;
        const hasUnread = (conversation.unread_count || 0) > 0;
        const formattedDate = format(
          new Date(conversation.last_message_at),
          "d MMM HH:mm",
          { locale: fr }
        );

        return (
          <div
            key={conversation.id}
            className={cn(
              "flex cursor-pointer hover:bg-gray-50 p-3",
              isActive && "bg-blue-50 hover:bg-blue-50"
            )}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex-shrink-0 mr-3">
              <img
                src={conversation.ad_image || "/placeholder.svg"}
                alt={conversation.ad_title || "Annonce"}
                className="h-14 w-14 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h3 className={cn(
                  "text-sm font-medium line-clamp-1",
                  hasUnread && "font-bold"
                )}>
                  {conversation.ad_title || "Annonce sans titre"}
                </h3>
                <span className="text-xs text-gray-500">{formattedDate}</span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {conversation.status === "active" ? "Conversation active" : "Archivée"}
                </p>
                
                {hasUnread && (
                  <Badge variant="default" className="bg-mboa-orange">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
