
import React from "react";
import { Loader2Icon } from "lucide-react";

const ConversationLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center items-center">
      <Loader2Icon className="h-10 w-10 animate-spin text-mboa-orange" />
      <p className="mt-3 text-sm text-gray-500">Chargement des messages...</p>
    </div>
  );
};

export default ConversationLoadingState;
