
import React, { useEffect, useRef } from "react";
import { Message } from "@/services/messageService";
import MessageBubble from "./MessageBubble";
import MessageForm from "./MessageForm";
import { Loader2 } from "lucide-react";

interface ConversationViewProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  loading?: boolean;
  adTitle?: string;
  emptyState?: React.ReactNode;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  onSendMessage,
  loading = false,
  adTitle,
  emptyState
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = useRef<string | null>(null);

  // Récupérer l'ID de l'utilisateur actuel
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        currentUserId.current = session.user.id;
      }
    };

    fetchCurrentUser();
  }, []);

  // Faire défiler jusqu'au dernier message quand messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
        <p className="mt-2 text-sm text-gray-500">Chargement des messages...</p>
      </div>
    );
  }

  if (messages.length === 0 && emptyState) {
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
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSender={message.sender_id === currentUserId.current}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageForm onSendMessage={onSendMessage} />
    </div>
  );
};

export default ConversationView;
