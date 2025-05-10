import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ad } from "@/hooks/useModerationAds";

interface ModerationTableProps {
  ads: Ad[];
  status: "pending" | "approved" | "rejected";
  isLoading: boolean;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string) => void;
}

const ModerationTable: React.FC<ModerationTableProps> = ({ 
  ads, 
  status, 
  isLoading,
  onApprove,
  onReject
}) => {
  const [selectedAd, setSelectedAd] = React.useState<Ad | null>(null);
  
  if (isLoading) {
    return <p className="text-center py-10">Chargement des annonces...</p>;
  }
  
  if (ads.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500">
        {status === "pending"
          ? "Aucune annonce en attente de modération."
          : status === "approved"
          ? "Aucune annonce approuvée."
          : "Aucune annonce rejetée."}
      </p>
    );
  }
  
  const getStatusBadge = (adStatus: string) => {
    switch (adStatus) {
      case "pending":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">En attente</span>;
      case "approved":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approuvée</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejetée</span>;
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">
                  <div className="w-16 h-16 relative">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title}
                      className="object-cover w-full h-full rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate">{ad.title}</div>
                </TableCell>
                <TableCell>{ad.category}</TableCell>
                <TableCell>{ad.price.toLocaleString('fr-FR')} XAF</TableCell>
                <TableCell>{ad.city}</TableCell>
                <TableCell>
                  {format(new Date(ad.created_at), "dd MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell>{getStatusBadge(ad.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedAd(ad)}
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
                          onClick={() => onApprove && onApprove(ad.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approuver</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => onReject && onReject(ad.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Rejeter</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialogue de prévisualisation de l'annonce */}
      {selectedAd && (
        <Dialog open={!!selectedAd} onOpenChange={() => setSelectedAd(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAd.title}</DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square rounded overflow-hidden">
                  <img
                    src={selectedAd.imageUrl}
                    alt={selectedAd.title}
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
                    <h3 className="font-semibold text-lg">{selectedAd.price.toLocaleString('fr-FR')} XAF</h3>
                    <p className="text-gray-600">{selectedAd.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{selectedAd.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Localisation</h4>
                    <p className="text-sm text-gray-600">{selectedAd.city}, {selectedAd.region}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-sm text-gray-600">Téléphone: {selectedAd.phone}</p>
                    {selectedAd.whatsapp && <p className="text-sm text-gray-600">WhatsApp: {selectedAd.whatsapp}</p>}
                  </div>
                  
                  <div className="pt-4">
                    {status === "pending" && (
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            onApprove && onApprove(selectedAd.id);
                            setSelectedAd(null);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approuver
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            onReject && onReject(selectedAd.id);
                            setSelectedAd(null);
                          }}
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
      )}
    </>
  );
};

export default ModerationTable;
