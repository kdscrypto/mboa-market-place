
import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
  className?: string;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, className }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus;
