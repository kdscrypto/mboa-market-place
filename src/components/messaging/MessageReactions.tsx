
import React, { useState } from "react";
import { Heart, ThumbsUp, ThumbsDown, Smile, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  messageId: string;
  reactions?: Record<string, string[]>; // emoji -> array of user IDs
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const QUICK_REACTIONS = [
  { emoji: "👍", label: "Pouce en l'air" },
  { emoji: "❤️", label: "Cœur" },
  { emoji: "😄", label: "Sourire" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😮", label: "Surpris" },
  { emoji: "🎉", label: "Fête" }
];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = {},
  currentUserId,
  onAddReaction,
  onRemoveReaction
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const userReactions = reactions[emoji] || [];
    const hasReacted = userReactions.includes(currentUserId);
    
    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    handleReactionClick(emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      {Object.entries(reactions).map(([emoji, userIds]) => {
        if (userIds.length === 0) return null;
        
        const hasReacted = userIds.includes(currentUserId);
        
        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 py-0 text-xs rounded-full",
              hasReacted 
                ? "bg-mboa-orange/20 text-mboa-orange border border-mboa-orange/30" 
                : "bg-gray-100 hover:bg-gray-200"
            )}
            onClick={() => handleReactionClick(emoji)}
          >
            <span className="mr-1">{emoji}</span>
            <span>{userIds.length}</span>
          </Button>
        );
      })}

      {/* Add reaction button */}
      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-3 gap-1">
            {QUICK_REACTIONS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                onClick={() => handleQuickReaction(emoji)}
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
