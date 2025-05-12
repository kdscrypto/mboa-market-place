
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ad } from "@/types/adTypes";
import AdStatusBadge from "./AdStatusBadge";
import AdActionButtons from "./AdActionButtons";
import AdPreviewDialog from "./AdPreviewDialog";
import RejectAdDialog from "./RejectAdDialog";

interface ModerationTableProps {
  ads: Ad[];
  status: "pending" | "approved" | "rejected";
  isLoading: boolean;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string, message?: string) => void;
}

const ModerationTable: React.FC<ModerationTableProps> = ({ 
  ads, 
  status, 
  isLoading,
  onApprove,
  onReject
}) => {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectAdId, setRejectAdId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Add debug logging
  useEffect(() => {
    console.log(`ModerationTable (${status}) updated:`, {
      adsCount: ads?.length || 0,
      isLoading
    });
  }, [ads, status, isLoading]);
  
  const handleRejectClick = (adId: string) => {
    setRejectAdId(adId);
    setShowRejectDialog(true);
  };
  
  const handleRejectConfirm = (adId: string, message: string) => {
    if (onReject) onReject(adId, message);
    setShowRejectDialog(false);
    setRejectAdId(null);
  };
  
  if (isLoading) {
    return <p className="text-center py-10">Chargement des annonces...</p>;
  }
  
  if (!ads || ads.length === 0) {
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
                <TableCell>
                  <AdStatusBadge status={ad.status} />
                </TableCell>
                <TableCell className="text-right">
                  <AdActionButtons 
                    adId={ad.id}
                    status={status}
                    onViewClick={() => setSelectedAd(ad)}
                    onApprove={onApprove}
                    onRejectClick={() => handleRejectClick(ad.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AdPreviewDialog
        ad={selectedAd}
        status={status}
        onClose={() => setSelectedAd(null)}
        onApprove={onApprove}
        onReject={(adId) => handleRejectClick(adId)}
      />
      
      {rejectAdId && (
        <RejectAdDialog
          adId={rejectAdId}
          open={showRejectDialog}
          onClose={() => setShowRejectDialog(false)}
          onReject={handleRejectConfirm}
        />
      )}
    </>
  );
};

export default ModerationTable;
