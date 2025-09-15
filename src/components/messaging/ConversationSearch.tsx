
import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/services/messaging/types";

interface ConversationSearchProps {
  conversations: Conversation[];
  onFilteredConversations: (filtered: Conversation[]) => void;
}

const ConversationSearch: React.FC<ConversationSearchProps> = ({
  conversations,
  onFilteredConversations
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter(conversation => 
      conversation.ad_title?.toLowerCase().includes(query) ||
      conversation.status.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFilteredConversations(filteredConversations);
  }, [filteredConversations, onFilteredConversations]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="px-3 py-2" style={{ backgroundColor: 'var(--messaging-sidebar-bg)', borderBottom: '1px solid var(--messaging-border)' }}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--messaging-text-muted)' }} />
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 rounded-lg border-0 focus:outline-none focus:ring-1 transition-all"
          style={{ 
            backgroundColor: 'var(--messaging-search-bg)', 
            color: 'var(--messaging-text-primary)',
            fontSize: '14px'
          }}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3" style={{ color: 'var(--messaging-text-muted)' }} />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="text-xs mt-2" style={{ color: 'var(--messaging-text-muted)' }}>
          {filteredConversations.length} conversation(s) trouvée(s)
        </p>
      )}
    </div>
  );
};

export default ConversationSearch;
