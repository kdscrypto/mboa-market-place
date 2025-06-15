
import React, { useState, useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Ad } from "@/types/adTypes";
import AdPreviewDialog from "./AdPreviewDialog";
import RejectAdDialog from "./RejectAdDialog";
import ModerationTableHeader from "./table/ModerationTableHeader";
import ModerationTableRow from "./table/ModerationTableRow";
import BulkActionsBar from "./table/BulkActionsBar";
import EmptyTableState from "./table/EmptyTableState";

interface ModerationTableProps {
  ads: Ad[];
  status: "pending" | "approved" | "rejected";
  isLoading: boolean;
  onApprove?: (adId: string) => void;
  onReject?: (adId: string, message?: string) => void;
  onDelete?: (adId: string) => void;
  onBulkApprove?: (adIds: string[]) => void;
  onBulkDelete?: (adIds: string[]) => void;
  selectedAds?: string[];
  onSelectedAdsChange?: (selectedAds: string[]) => void;
}

const ModerationTable: React.FC<ModerationTableProps> = ({ 
  ads, 
  status, 
  isLoading,
  onApprove,
  onReject,
  onDelete,
  onBulkApprove,
  onBulkDelete,
  selectedAds = [],
  onSelectedAdsChange
}) => {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [rejectAdId, setRejectAdId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [localSelectedAds, setLocalSelectedAds] = useState<string[]>([]);
  
  // Use external selectedAds if provided, otherwise use local state
  const currentSelectedAds = onSelectedAdsChange ? selectedAds : localSelectedAds;
  
  // Add debug logging
  useEffect(() => {
    console.log(`ModerationTable (${status}) updated:`, {
      adsCount: ads?.length || 0,
      isLoading
    });
  }, [ads, status, isLoading]);

  // Reset selected ads when ads change
  useEffect(() => {
    if (onSelectedAdsChange) {
      onSelectedAdsChange([]);
    } else {
      setLocalSelectedAds([]);
    }
  }, [ads, onSelectedAdsChange]);
  
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
    const newSelection = checked ? ads.map(ad => ad.id) : [];
    if (onSelectedAdsChange) {
      onSelectedAdsChange(newSelection);
    } else {
      setLocalSelectedAds(newSelection);
    }
  };

  const handleSelectAd = (adId: string, checked: boolean) => {
    if (onSelectedAdsChange) {
      const newSelection = checked 
        ? [...currentSelectedAds, adId]
        : currentSelectedAds.filter(id => id !== adId);
      onSelectedAdsChange(newSelection);
    } else {
      if (checked) {
        setLocalSelectedAds(prev => [...prev, adId]);
      } else {
        setLocalSelectedAds(prev => prev.filter(id => id !== adId));
      }
    }
  };

  const handleBulkApprove = () => {
    if (currentSelectedAds.length > 0 && onBulkApprove) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir approuver ${currentSelectedAds.length} annonce(s) ?`);
      if (confirmed) {
        onBulkApprove(currentSelectedAds);
        if (onSelectedAdsChange) {
          onSelectedAdsChange([]);
        } else {
          setLocalSelectedAds([]);
        }
      }
    }
  };

  const handleBulkDelete = () => {
    if (currentSelectedAds.length > 0 && onBulkDelete) {
      const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${currentSelectedAds.length} annonce(s) ? Cette action est irréversible.`);
      if (confirmed) {
        onBulkDelete(currentSelectedAds);
        if (onSelectedAdsChange) {
          onSelectedAdsChange([]);
        } else {
          setLocalSelectedAds([]);
        }
      }
    }
  };

  const isAllSelected = ads.length > 0 && currentSelectedAds.length === ads.length;
  const isSomeSelected = currentSelectedAds.length > 0 && currentSelectedAds.length < ads.length;
  
  if (isLoading || !ads || ads.length === 0) {
    return <EmptyTableState status={status} isLoading={isLoading} />;
  }

  const showBulkActions = (status === "pending" && !!onBulkApprove) || ((status === "rejected" || status === "approved") && !!onBulkDelete);
  
  return (
    <>
      {showBulkActions && (
        <BulkActionsBar
          status={status}
          selectedCount={currentSelectedAds.length}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          onSelectAll={handleSelectAll}
          onBulkApprove={status === "pending" ? handleBulkApprove : undefined}
          onBulkDelete={(status === "rejected" || status === "approved") ? handleBulkDelete : undefined}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <ModerationTableHeader
            showBulkActions={showBulkActions}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody>
            {ads.map((ad) => (
              <ModerationTableRow
                key={ad.id}
                ad={ad}
                status={status}
                showBulkActions={showBulkActions}
                isSelected={currentSelectedAds.includes(ad.id)}
                onSelectAd={handleSelectAd}
                onViewClick={setSelectedAd}
                onApprove={handleApproveClick}
                onRejectClick={handleRejectClick}
                onDelete={onDelete}
              />
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
