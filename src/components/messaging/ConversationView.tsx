
import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/services/messaging/types";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ConversationViewProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  loading?: boolean;
  adTitle?: string;
  emptyState?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  onSendMessage,
  loading = false,
  adTitle,
  emptyState,
  error = null,
  onRetry
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const previousLoadingState = useRef<boolean>(loading);
  const previousErrorState = useRef<string | null>(error);
  const previousMessagesLength = useRef<number>(messages.length);

  // Make sure to preserve loaded messages even when props.messages is temporarily empty
  useEffect(() => {
    // Only update loaded messages when we have new messages or when coming out of loading state with messages
    if (messages && messages.length > 0) {
      console.log("Updating loaded messages with new messages:", messages.length);
      setLoadedMessages(messages);
      previousMessagesLength.current = messages.length;
    } 
    // Track loading state changes
    previousLoadingState.current = loading;
    previousErrorState.current = error;
  }, [messages, loading, error]);

  // Fetch current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data && data.session) {
          setCurrentUserId(data.session.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && loadedMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loadedMessages]);

  // Handle error state first
  if (error) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-center p-4">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-700 mb-4">{error}</p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            className="bg-mboa-orange hover:bg-mboa-orange/90 text-white"
          >
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-mboa-orange" />
        <p className="mt-3 text-sm text-gray-500">Chargement des messages...</p>
      </div>
    );
  }

  // If no messages and empty state is provided
  if (loadedMessages.length === 0 && messages.length === 0 && emptyState) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow flex flex-col justify-center items-center">
          {emptyState}
        </div>
        <MessageForm onSendMessage={onSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {adTitle && (
        <div className="bg-white p-3 border-b">
          <h3 className="font-medium text-sm">Annonce: {adTitle}</h3>
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto px-4 py-2">
        {loadedMessages.length > 0 ? (
          loadedMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isSender={message.sender_id === currentUserId}
            />
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Aucun message à afficher</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageForm onSendMessage={onSendMessage} />
    </div>
  );
};

export default ConversationView;
