
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import AttachmentUpload from "./AttachmentUpload";

interface MessageFormProps {
  onSendMessage: (message: string, attachment?: { file: File; type: string }) => Promise<void>;
  disabled?: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedFile) || disabled || sending) return;
    
    setSending(true);
    try {
      const attachment = selectedFile ? {
        file: selectedFile,
        type: selectedFile.type
      } : undefined;

      await onSendMessage(message, attachment);
      setMessage("");
      handleAttachmentRemove();
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

  const handleAttachmentSelect = (file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  };

  const handleAttachmentRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="px-4 py-3 sticky bottom-0"
      style={{ backgroundColor: 'var(--messaging-main-bg)', borderTop: '1px solid var(--messaging-border)' }}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-1 resize-none rounded-3xl transition-all"
            style={{
              backgroundColor: 'var(--messaging-input-bg)',
              color: 'var(--messaging-text-primary)',
              minHeight: '40px',
              maxHeight: '120px'
            }}
            disabled={disabled || sending}
            rows={1}
          />
          
          <AttachmentUpload
            onAttachmentSelect={handleAttachmentSelect}
            onAttachmentRemove={handleAttachmentRemove}
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            disabled={disabled || sending}
          />
        </div>
        
        <button
          type="submit"
          className="w-10 h-10 rounded-full border-0 flex items-center justify-center transition-colors"
          style={{
            backgroundColor: (!message.trim() && !selectedFile) || disabled || sending 
              ? 'var(--messaging-text-muted)' 
              : 'var(--messaging-green)',
            color: 'white'
          }}
          disabled={(!message.trim() && !selectedFile) || disabled || sending}
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
