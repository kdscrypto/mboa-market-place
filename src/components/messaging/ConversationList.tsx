
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
      <ScrollArea className="h-full whatsapp-scrollbar">
        <div>
          {conversations.map((conversation) => {
            const isActive = conversation.id === currentConversation;
            const hasUnread = (conversation.unread_count || 0) > 0;
            const formattedDate = format(
              new Date(conversation.last_message_at),
              "HH:mm",
              { locale: fr }
            );

            return (
              <div
                key={conversation.id}
                className={cn(
                  "flex cursor-pointer px-4 py-3 transition-colors relative",
                  isActive 
                    ? "hover:bg-opacity-80" 
                    : "hover:bg-opacity-80"
                )}
                style={{ 
                  backgroundColor: isActive ? 'var(--messaging-surface-selected)' : 'transparent',
                  borderBottom: '1px solid var(--messaging-border)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--messaging-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={() => onSelectConversation(conversation.id)}
              >
                {/* WhatsApp-style circular avatar */}
                <div className="flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden" style={{ border: '1px solid var(--messaging-border)' }}>
                    <img
                      src={conversation.ad_image || "/placeholder.svg"}
                      alt={conversation.ad_title || "Annonce"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>
                
                {/* WhatsApp-style content layout */}
                <div className="flex-1 min-w-0">
                  {/* First line: Name + Timestamp */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {conversation.pinned && (
                        <Pin className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--messaging-green)' }} />
                      )}
                      {conversation.archived && (
                        <Archive className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--messaging-text-muted)' }} />
                      )}
                      <h3 className={cn(
                        "text-sm truncate",
                        hasUnread ? "font-semibold" : "font-medium"
                      )} style={{ color: 'var(--messaging-text-primary)' }}>
                        {conversation.ad_title || "Annonce sans titre"}
                      </h3>
                    </div>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--messaging-timestamp)' }}>
                      {formattedDate}
                    </span>
                  </div>
                  
                  {/* Second line: Last message + Unread badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate flex-1" style={{ color: 'var(--messaging-text-secondary)' }}>
                      {conversation.status === "active" ? "Conversation active" : "Archivée"}
                    </p>
                    
                    {hasUnread && (
                      <div 
                        className="rounded-full min-w-[20px] h-5 flex items-center justify-center px-2 ml-2 flex-shrink-0"
                        style={{ backgroundColor: 'var(--messaging-unread)', color: 'white', fontSize: '11px', fontWeight: '600' }}
                      >
                        {conversation.unread_count}
                      </div>
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
