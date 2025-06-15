
import { useState } from "react";
import { Ad } from "@/types/adTypes";

interface UseModerationTableActionsProps {
  onApprove?: (adId: string) => void;
  onReject?: (adId: string, message?: string) => void;
  onDelete?: (adId: string) => void;
  onBulkApprove?: (adIds: string[]) => void;
  onBulkDelete?: (adIds: string[]) => void;
  onSelectedAdsChange?: (selectedAds: string[]) => void;
}

export const useModerationTableActions = ({
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkDelete,
  onSelectedAdsChange
}: UseModerationTableActionsProps) => {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectAdId, setRejectAdId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

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

  const handleBulkApprove = (currentSelectedAds: string[]) => {
    if (currentSelectedAds.length > 0 && onBulkApprove) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir approuver ${currentSelectedAds.length} annonce(s) ?`);
      if (confirmed) {
        onBulkApprove(currentSelectedAds);
        if (onSelectedAdsChange) {
          onSelectedAdsChange([]);
        }
      }
    }
  };

  const handleBulkDelete = (currentSelectedAds: string[]) => {
    if (currentSelectedAds.length > 0 && onBulkDelete) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${currentSelectedAds.length} annonce(s) ? Cette action est irréversible.`);
      if (confirmed) {
        onBulkDelete(currentSelectedAds);
        if (onSelectedAdsChange) {
          onSelectedAdsChange([]);
        }
      }
    }
  };

  const closeRejectDialog = () => {
    console.log("Closing reject dialog");
    setShowRejectDialog(false);
    setRejectAdId(null);
  };

  return {
    selectedAd,
    setSelectedAd,
    rejectAdId,
    showRejectDialog,
    handleRejectClick,
    handleRejectConfirm,
    handleApproveClick,
    handleBulkApprove,
    handleBulkDelete,
    closeRejectDialog
  };
};
