
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
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
  onDelete?: (adId: string) => void;
  onBulkApprove?: (adIds: string[]) => void;
  onBulkDelete?: (adIds: string[]) => void;
}

const ModerationTable: React.FC<ModerationTableProps> = ({ 
  ads, 
  status, 
  isLoading,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkDelete
}) => {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectAdId, setRejectAdId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  
  // Add debug logging
  useEffect(() => {
    console.log(`ModerationTable (${status}) updated:`, {
      adsCount: ads?.length || 0,
      isLoading
    });
  }, [ads, status, isLoading]);

  // Reset selected ads when ads change
  useEffect(() => {
    setSelectedAds([]);
  }, [ads]);
  
  const handleRejectClick = (adId: string) => {
    console.log("Opening reject dialog for ad:", adId);
    setRejectAdId(adId);
    setShowRejectDialog(true);
  };
  
  const handleRejectConfirm = (adId: string, message: string) => {
    console.log("Confirming rejection for ad:", adId, "with message:", message);
    if (onReject) {
      onReject(adId, message);
    }
    setShowRejectDialog(false);
    setRejectAdId(null);
  };

  const handleApproveClick = (adId: string) => {
    console.log("ModerationTable: handleApproveClick called for ad", adId);
    if (onApprove) {
      onApprove(adId);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAds(ads.map(ad => ad.id));
    } else {
      setSelectedAds([]);
    }
  };

  const handleSelectAd = (adId: string, checked: boolean) => {
    if (checked) {
      setSelectedAds(prev => [...prev, adId]);
    } else {
      setSelectedAds(prev => prev.filter(id => id !== adId));
    }
  };

  const handleBulkApprove = () => {
    if (selectedAds.length > 0 && onBulkApprove) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir approuver ${selectedAds.length} annonce(s) ?`);
      if (confirmed) {
        onBulkApprove(selectedAds);
        setSelectedAds([]);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedAds.length > 0 && onBulkDelete) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${selectedAds.length} annonce(s) ? Cette action est irréversible.`);
      if (confirmed) {
        onBulkDelete(selectedAds);
        setSelectedAds([]);
      }
    }
  };

  const isAllSelected = ads.length > 0 && selectedAds.length === ads.length;
  const isSomeSelected = selectedAds.length > 0 && selectedAds.length < ads.length;
  
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

  const showBulkActions = (status === "pending" && onBulkApprove) || (status === "rejected" && onBulkDelete);
  
  return (
    <>
      {showBulkActions && (
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              ref={(el) => {
                if (el) {
                  el.indeterminate = isSomeSelected;
                }
              }}
            />
            <span className="text-sm text-gray-600">
              {selectedAds.length > 0 ? `${selectedAds.length} sélectionnée(s)` : "Tout sélectionner"}
            </span>
          </div>
          
          {selectedAds.length > 0 && (
            <div className="flex gap-2">
              {status === "pending" && onBulkApprove && (
                <Button
                  onClick={handleBulkApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approuver ({selectedAds.length})
                </Button>
              )}
              
              {status === "rejected" && onBulkDelete && (
                <Button
                  onClick={handleBulkDelete}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedAds.length})
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showBulkActions && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isSomeSelected;
                      }
                    }}
                  />
                </TableHead>
              )}
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
                {showBulkActions && (
                  <TableCell>
                    <Checkbox
                      checked={selectedAds.includes(ad.id)}
                      onCheckedChange={(checked) => handleSelectAd(ad.id, checked as boolean)}
                    />
                  </TableCell>
                )}
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
                    onApprove={() => handleApproveClick(ad.id)}
                    onRejectClick={() => handleRejectClick(ad.id)}
                    onDelete={onDelete}
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
        onApprove={onApprove ? handleApproveClick : undefined}
        onReject={handleRejectClick}
      />
      
      {rejectAdId && (
        <RejectAdDialog
          adId={rejectAdId}
          open={showRejectDialog}
          onClose={() => {
            console.log("Closing reject dialog");
            setShowRejectDialog(false);
            setRejectAdId(null);
          }}
          onReject={handleRejectConfirm}
        />
      )}
    </>
  );
};

export default ModerationTable;
