
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttachmentUploadProps {
  onAttachmentSelect: (file: File, previewUrl: string) => void;
  onAttachmentRemove: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  disabled?: boolean;
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onAttachmentSelect,
  onAttachmentRemove,
  selectedFile,
  previewUrl,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non supporté");
      return;
    }

    // Créer une URL de prévisualisation
    const preview = URL.createObjectURL(file);
    onAttachmentSelect(file, preview);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 max-w-xs">
          {selectedFile && isImage(selectedFile.type) && previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-8 w-8 object-cover rounded"
            />
          ) : (
            <div className="h-8 w-8 bg-gray-300 rounded flex items-center justify-center">
              <Upload className="h-4 w-4" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{selectedFile?.name}</p>
            <p className="text-xs text-gray-500">
              {selectedFile && formatFileSize(selectedFile.size)}
            </p>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAttachmentRemove}
            className="p-1 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
