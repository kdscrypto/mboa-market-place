
import React from "react";
import { Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdActionButtonsProps {
  adId: string;
  status: "pending" | "approved" | "rejected";
  onViewClick: () => void;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string) => void;
  onRejectClick?: () => void; // Prop pour ouvrir la boîte de dialogue de rejet
}

const AdActionButtons: React.FC<AdActionButtonsProps> = ({
  adId,
  status,
  onViewClick,
  onApprove,
  onReject,
  onRejectClick
}) => {
  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onApprove) {
      console.log("AdActionButtons: handleApprove called for ad", adId);
      onApprove(adId);
    }
  };
  
  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRejectClick) {
      console.log("AdActionButtons: handleRejectClick called for ad", adId);
      onRejectClick();
    }
  };
  
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onViewClick();
        }}
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">Voir</span>
      </Button>
      
      {status === "pending" && (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={handleApprove}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Approuver</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleRejectClick}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Rejeter</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default AdActionButtons;
