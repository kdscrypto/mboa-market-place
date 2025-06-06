
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
    <div className="p-3 border-b bg-white">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {searchQuery && (
        <p className="text-xs text-gray-500 mt-2">
          {filteredConversations.length} conversation(s) trouvée(s)
        </p>
      )}
    </div>
  );
};

export default ConversationSearch;
