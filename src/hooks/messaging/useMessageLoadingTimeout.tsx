
import { useRef, useCallback } from 'react';
import { toast } from "sonner";

export const useMessageLoadingTimeout = () => {
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const setLoadingTimeout = useCallback((conversationId: string, onTimeout: () => void) => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Set a timeout to stop loading after 10 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      console.error(`[MSG DEBUG] Timeout reached for conversation: ${conversationId}`);
      onTimeout();
      toast.error("Délai d'attente dépassé lors du chargement des messages");
    }, 10000);
  }, []);
  
  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, []);
  
  return {
    setLoadingTimeout,
    clearLoadingTimeout
  };
};
