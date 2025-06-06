
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { reportMessage } from "@/services/messaging/conversationManagementService";

interface MessageReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam ou publicité non désirée" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement ou intimidation" },
  { value: "scam", label: "Arnaque ou fraude" },
  { value: "other", label: "Autre" },
];

const MessageReportDialog: React.FC<MessageReportDialogProps> = ({
  isOpen,
  onClose,
  messageId
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error("Veuillez sélectionner une raison");
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await reportMessage(messageId, reason, description);
      
      if (success) {
        toast.success("Message signalé avec succès");
        setReason("");
        setDescription("");
        onClose();
      } else {
        toast.error(error || "Erreur lors du signalement");
      }
    } catch (error) {
      toast.error("Erreur lors du signalement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler ce message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Raison du signalement</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {REPORT_REASONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des détails sur le problème..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !reason}>
              {loading ? "Signalement..." : "Signaler"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageReportDialog;
