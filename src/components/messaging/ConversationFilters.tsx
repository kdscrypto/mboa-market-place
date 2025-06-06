
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Pin, Inbox } from "lucide-react";

interface ConversationFiltersProps {
  activeFilter: 'all' | 'archived' | 'pinned';
  onFilterChange: (filter: 'all' | 'archived' | 'pinned') => void;
  counts: {
    all: number;
    archived: number;
    pinned: number;
  };
}

const ConversationFilters: React.FC<ConversationFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts
}) => {
  return (
    <div className="flex gap-2 p-3 border-b">
      <Button
        variant={activeFilter === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className="flex items-center gap-2"
      >
        <Inbox className="h-4 w-4" />
        Toutes
        <Badge variant="secondary" className="ml-1">
          {counts.all}
        </Badge>
      </Button>
      
      <Button
        variant={activeFilter === 'pinned' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('pinned')}
        className="flex items-center gap-2"
      >
        <Pin className="h-4 w-4" />
        Épinglées
        <Badge variant="secondary" className="ml-1">
          {counts.pinned}
        </Badge>
      </Button>
      
      <Button
        variant={activeFilter === 'archived' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onFilterChange('archived')}
        className="flex items-center gap-2"
      >
        <Archive className="h-4 w-4" />
        Archivées
        <Badge variant="secondary" className="ml-1">
          {counts.archived}
        </Badge>
      </Button>
    </div>
  );
};

export default ConversationFilters;
