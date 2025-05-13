
import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ad } from "@/types/adTypes";

interface AdPreviewDialogProps {
  ad: Ad | null;
  status: "pending" | "approved" | "rejected";
  onClose: () => void;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string) => void;
}

const AdPreviewDialog: React.FC<AdPreviewDialogProps> = ({
  ad,
  status,
  onClose,
  onApprove,
  onReject
}) => {
  if (!ad) return null;
  
  const handleApprove = () => {
    if (onApprove && ad) {
      console.log("AdPreviewDialog: handleApprove called for ad", ad.id);
      onApprove(ad.id);
      onClose();
    }
  };
  
  const handleReject = () => {
    if (onReject && ad) {
      console.log("AdPreviewDialog: handleReject called for ad", ad.id);
      onReject(ad.id);
    }
  };
  
  return (
    <Dialog open={!!ad} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{ad.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="aspect-square rounded overflow-hidden">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
          
          <div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{ad.price.toLocaleString('fr-FR')} XAF</h3>
                <p className="text-gray-600">{ad.category}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{ad.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Localisation</h4>
                <p className="text-sm text-gray-600">{ad.city}, {ad.region}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Contact</h4>
                <p className="text-sm text-gray-600">Téléphone: {ad.phone}</p>
                {ad.whatsapp && <p className="text-sm text-gray-600">WhatsApp: {ad.whatsapp}</p>}
              </div>
              
              {ad.status === "rejected" && ad.reject_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="font-medium text-red-700">Motif du rejet</h4>
                  <p className="text-sm text-red-600 whitespace-pre-line">{ad.reject_reason}</p>
                </div>
              )}
              
              <div className="pt-4">
                {status === "pending" && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleApprove}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    
                    <Button 
                      onClick={handleReject}
                      variant="destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdPreviewDialog;
