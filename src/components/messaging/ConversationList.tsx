
import React from "react";
import { Conversation } from "@/services/messaging/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pin, Archive } from "lucide-react";
import ConversationActions from "./ConversationActions";
import ConversationLabels from "./ConversationLabels";

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
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="divide-y">
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
                  "flex cursor-pointer hover:bg-gray-50 p-3 transition-colors relative",
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
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {conversation.pinned && (
                        <Pin className="h-3 w-3 text-mboa-orange flex-shrink-0" />
                      )}
                      {conversation.archived && (
                        <Archive className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      )}
                      <h3 className={cn(
                        "text-sm font-medium line-clamp-1",
                        hasUnread && "font-bold"
                      )}>
                        {conversation.ad_title || "Annonce sans titre"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-500">{formattedDate}</span>
                      <ConversationActions
                        conversationId={conversation.id}
                        isArchived={conversation.archived}
                        isPinned={conversation.pinned}
                      />
                    </div>
                  </div>
                  
                  <ConversationLabels conversationId={conversation.id} />
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {conversation.status === "active" ? "Conversation active" : "Archivée"}
                    </p>
                    
                    {hasUnread && (
                      <Badge variant="default" className="bg-mboa-orange flex-shrink-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
