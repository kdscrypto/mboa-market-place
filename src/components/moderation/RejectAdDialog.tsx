
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectAdDialogProps {
  adId: string;
  open: boolean;
  onClose: () => void;
  onReject: (adId: string, message: string) => void;
}

const RejectAdDialog: React.FC<RejectAdDialogProps> = ({
  adId,
  open,
  onClose,
  onReject,
}) => {
  const [rejectMessage, setRejectMessage] = useState("");
  
  // Reset le message quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setRejectMessage("");
    }
  }, [open]);

  const handleReject = () => {
    console.log("RejectAdDialog: Rejecting ad with message:", rejectMessage);
    onReject(adId, rejectMessage);
  };

  const handleCancel = () => {
    setRejectMessage("");
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rejeter cette annonce</AlertDialogTitle>
          <AlertDialogDescription>
            Veuillez indiquer les raisons du rejet. Ce message sera envoyé à l'auteur de l'annonce.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <Textarea
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            placeholder="Ex: Votre annonce ne respecte pas nos conditions d'utilisation car..."
            className="min-h-[120px]"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!rejectMessage.trim()}
          >
            <X className="mr-2 h-4 w-4" />
            Rejeter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectAdDialog;
