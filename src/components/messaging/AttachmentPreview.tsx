
import React from "react";
import { Download, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentPreviewProps {
  attachmentUrl: string;
  attachmentName: string;
  attachmentType: string;
  attachmentSize?: number | null;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachmentUrl,
  attachmentName,
  attachmentType,
  attachmentSize
}) => {
  const isImage = attachmentType.startsWith('image/');
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = attachmentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isImage) {
    return (
      <div className="mt-2">
        <img 
          src={attachmentUrl} 
          alt={attachmentName}
          className="max-w-xs max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(attachmentUrl, '_blank')}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">{attachmentName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="p-1 h-6"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 bg-gray-50 rounded-lg p-3 max-w-xs">
      <div className="flex items-center gap-2">
        <FileText className="h-8 w-8 text-gray-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachmentName}</p>
          {attachmentSize && (
            <p className="text-xs text-gray-500">{formatFileSize(attachmentSize)}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="p-1 h-8 w-8"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AttachmentPreview;
