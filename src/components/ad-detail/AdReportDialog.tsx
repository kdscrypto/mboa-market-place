import React, { useState } from "react";
import { Flag, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { REPORT_REASONS } from "@/services/adReportService";

interface AdReportDialogProps {
  hasReported: boolean;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onSubmit: (reportData: { reason: string; description: string }) => Promise<boolean>;
}

const AdReportDialog: React.FC<AdReportDialogProps> = ({
  hasReported,
  isSubmitting,
  isLoggedIn,
  onSubmit
}) => {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason || !description.trim()) return;
    
    const success = await onSubmit({ reason: selectedReason, description });
    if (success) {
      setOpen(false);
      setSelectedReason("");
      setDescription("");
    }
  };

  if (!isLoggedIn) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Flag className="h-4 w-4 mr-2" />
        Signaler
      </Button>
    );
  }

  if (hasReported) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Flag className="h-4 w-4 mr-2" />
        Déjà signalé
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Signaler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Signaler cette annonce
          </DialogTitle>
          <DialogDescription>
            Aidez-nous à maintenir la sécurité de la plateforme en signalant les contenus problématiques.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Motif du signalement</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="text-sm">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème que vous avez identifié..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Les signalements abusifs peuvent entraîner des sanctions sur votre compte.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!selectedReason || !description.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdReportDialog;