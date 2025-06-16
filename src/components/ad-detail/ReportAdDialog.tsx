
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createAdReport } from "@/services/adReportService";

interface ReportAdDialogProps {
  adId: string;
  adTitle: string;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam ou annonce en double" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "scam", label: "Arnaque suspectée" },
  { value: "fake", label: "Annonce frauduleuse" },
  { value: "price", label: "Prix incorrect ou trompeur" },
  { value: "category", label: "Mauvaise catégorie" },
  { value: "other", label: "Autre" },
];

const ReportAdDialog: React.FC<ReportAdDialogProps> = ({ adId, adTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      const { success, error } = await createAdReport(adId, reason, description);
      
      if (success) {
        toast.success("Signalement envoyé avec succès");
        setReason("");
        setDescription("");
        setIsOpen(false);
      } else {
        toast.error(error || "Erreur lors du signalement");
      }
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      toast.error("Erreur lors du signalement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Signaler cette annonce
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Signaler une annonce
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Annonce concernée</Label>
            <p className="text-sm text-gray-600 truncate">{adTitle}</p>
          </div>

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
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !reason}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signalement...
                </>
              ) : "Signaler"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAdDialog;
