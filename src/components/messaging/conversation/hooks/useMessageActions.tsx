
import { useCallback } from "react";

export const useMessageActions = () => {
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    // TODO: Implement real reaction functionality with backend
  }, []);

  const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
    console.log(`Removing reaction ${emoji} from message ${messageId}`);
    // TODO: Implement real reaction functionality with backend
  }, []);

  return {
    handleAddReaction,
    handleRemoveReaction
  };
};
