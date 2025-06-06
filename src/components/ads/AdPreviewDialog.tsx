
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "./AdPlansData";
import { AdFormData } from "./AdFormTypes";
import { regions, categories } from "./LocationData";
import { adPlans } from "./AdPlansData";

interface AdPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AdFormData;
  imageURLs: string[];
  isLoading: boolean;
  isSubmitted?: boolean;
  onSubmit: () => void;
}

const AdPreviewDialog = ({ 
  open, 
  onOpenChange, 
  formData, 
  imageURLs, 
  isLoading,
  isSubmitted = false,
  onSubmit 
}: AdPreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation de l'annonce</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Preview content */}
          <div className="space-y-4">
            {/* Images */}
            {imageURLs.length > 0 ? (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src={imageURLs[0]}
                  alt="Image principale"
                  className="w-full h-full object-contain"
                />
                
                {imageURLs.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                    {imageURLs.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-mboa-orange" : "bg-white/70"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Aucune image</p>
              </div>
            )}
            
            {/* Title and Price */}
            <div>
              <h2 className="text-xl font-bold">{formData.title || "Titre de l'annonce"}</h2>
              {formData.price && (
                <p className="text-xl font-bold text-mboa-orange mt-1">
                  {formatPrice(formData.price)} XAF
                </p>
              )}
            </div>
            
            {/* Ad Type Badge */}
            {formData.adType !== "standard" && (
              <div className="inline-flex bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                {adPlans.find(p => p.id === formData.adType)?.name || "Premium"}
              </div>
            )}
            
            {/* Location */}
            <div className="text-sm text-gray-600">
              {formData.city && formData.region ? (
                <p>
                  {formData.city}, {regions.find(r => r.id.toString() === formData.region)?.name}
                </p>
              ) : (
                <p>Lieu non spécifié</p>
              )}
            </div>
            
            {/* Category */}
            <div className="text-sm text-mboa-orange">
              {formData.category ? (
                <p>
                  {categories.find(c => c.id.toString() === formData.category)?.name}
                </p>
              ) : (
                <p>Catégorie non spécifiée</p>
              )}
            </div>
            
            {/* Description */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="whitespace-pre-wrap text-gray-700">
                {formData.description || "Aucune description fournie."}
              </div>
            </div>
            
            {/* Contact info (will be hidden in the preview) */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-sm text-gray-600">
                Les coordonnées du vendeur seront visibles uniquement aux utilisateurs connectés.
              </p>
            </div>
            
            {/* Status notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm font-medium">
                Cette annonce sera soumise à modération avant d'être publiée sur le site.
                Vous pouvez suivre son statut dans votre tableau de bord.
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Modifier l'annonce
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 bg-mboa-orange hover:bg-mboa-orange/90"
              disabled={isLoading || isSubmitted}
            >
              {isLoading ? "Traitement..." : isSubmitted ? "Déjà soumise" : "Publier définitivement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdPreviewDialog;
