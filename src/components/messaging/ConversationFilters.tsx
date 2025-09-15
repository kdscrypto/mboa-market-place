
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Pin, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex gap-1 px-4 py-2" style={{ borderBottom: '1px solid var(--messaging-border)', backgroundColor: 'var(--messaging-sidebar-bg)' }}>
      <button
        onClick={() => onFilterChange('all')}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
          activeFilter === 'all' 
            ? "text-white" 
            : "hover:bg-white/10"
        )}
        style={{ 
          backgroundColor: activeFilter === 'all' ? 'var(--messaging-green)' : 'transparent',
          color: activeFilter === 'all' ? 'white' : 'var(--messaging-text-secondary)'
        }}
      >
        Toutes {counts.all > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {counts.all}
          </span>
        )}
      </button>
      
      <button
        onClick={() => onFilterChange('pinned')}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
          activeFilter === 'pinned' 
            ? "text-white" 
            : "hover:bg-white/10"
        )}
        style={{ 
          backgroundColor: activeFilter === 'pinned' ? 'var(--messaging-green)' : 'transparent',
          color: activeFilter === 'pinned' ? 'white' : 'var(--messaging-text-secondary)'
        }}
      >
        Épinglées {counts.pinned > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {counts.pinned}
          </span>
        )}
      </button>
      
      <button
        onClick={() => onFilterChange('archived')}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
          activeFilter === 'archived' 
            ? "text-white" 
            : "hover:bg-white/10"
        )}
        style={{ 
          backgroundColor: activeFilter === 'archived' ? 'var(--messaging-green)' : 'transparent',
          color: activeFilter === 'archived' ? 'white' : 'var(--messaging-text-secondary)'
        }}
      >
        Archivées {counts.archived > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {counts.archived}
          </span>
        )}
      </button>
    </div>
  );
};

export default ConversationFilters;
