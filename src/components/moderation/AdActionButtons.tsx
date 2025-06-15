
import React from "react";
import { Eye, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdActionButtonsProps {
  adId: string;
  status: "pending" | "approved" | "rejected";
  onViewClick: () => void;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string) => void;
  onRejectClick?: () => void;
  onDelete?: (adId: string) => void;
}

const AdActionButtons: React.FC<AdActionButtonsProps> = ({
  adId,
  status,
  onViewClick,
  onApprove,
  onRejectClick,
  onDelete
}) => {
  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("AdActionButtons: handleApprove called for ad", adId);
    if (onApprove) {
      onApprove(adId);
    }
  };
  
  const handleRejectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("AdActionButtons: handleRejectClick called for ad", adId);
    if (onRejectClick) {
      onRejectClick();
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ? Cette action est irréversible.")) {
      console.log("AdActionButtons: handleDelete called for ad", adId);
      if (onDelete) {
        onDelete(adId);
      }
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
        type="button"
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
            type="button"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Approuver</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleRejectClick}
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Rejeter</span>
          </Button>
        </>
      )}
      
      {(status === "rejected" || status === "approved") && onDelete && (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 border-red-600 hover:bg-red-50"
          onClick={handleDelete}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      )}
    </div>
  );
};

export default AdActionButtons;
