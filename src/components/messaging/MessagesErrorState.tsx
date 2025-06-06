
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessagesErrorStateProps {
  error: string;
  onRetry: () => void;
}

const MessagesErrorState: React.FC<MessagesErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-6">
      <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
      <h3 className="text-lg font-medium">Une erreur est survenue</h3>
      <p className="text-gray-500 mt-1 mb-4">{error}</p>
      <Button
        onClick={onRetry}
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        Réessayer
      </Button>
    </div>
  );
};

export default MessagesErrorState;
