
import React from "react";
import { Button } from "@/components/ui/button";

interface CreateAdHeaderProps {
  isSubmitted: boolean;
  onNewAd: () => void;
}

const CreateAdHeader = ({ isSubmitted, onNewAd }: CreateAdHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Publier une annonce</h1>
      {isSubmitted && (
        <Button 
          onClick={onNewAd}
          variant="outline"
          className="text-sm"
        >
          Nouvelle annonce
        </Button>
      )}
    </div>
  );
};

export default CreateAdHeader;
