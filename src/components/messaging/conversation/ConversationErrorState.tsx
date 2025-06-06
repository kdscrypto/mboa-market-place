
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConversationErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ConversationErrorState: React.FC<ConversationErrorStateProps> = ({
  error,
  onRetry
}) => {
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
};

export default ConversationErrorState;
