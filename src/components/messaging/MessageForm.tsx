
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageFormProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || sending) return;
    
    setSending(true);
    try {
      await onSendMessage(message);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Envoyer le message avec Entrée (sans Shift pour les sauts de ligne)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t pt-3 pb-3 bg-white sticky bottom-0"
    >
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message..."
          className="min-h-[60px] resize-none"
          disabled={disabled || sending}
        />
        <Button
          type="submit"
          className="h-10 w-10 p-0 bg-mboa-orange hover:bg-mboa-orange/90"
          disabled={!message.trim() || disabled || sending}
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;
