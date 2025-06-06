
import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MessagesEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium">Sélectionnez une conversation</h3>
      <p className="text-gray-500 mt-1 mb-4 text-center">
        Choisissez une conversation dans la liste ou contactez un vendeur
      </p>
      <Button
        onClick={() => navigate("/")}
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        Parcourir les annonces
      </Button>
    </div>
  );
};

export default MessagesEmptyState;
