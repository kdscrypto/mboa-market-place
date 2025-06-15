
import React, { useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Ad } from "@/types/adTypes";
import AdPreviewDialog from "./AdPreviewDialog";
import RejectAdDialog from "./RejectAdDialog";
import ModerationTableHeader from "./table/ModerationTableHeader";
import ModerationTableRow from "./table/ModerationTableRow";
import BulkActionsBar from "./table/BulkActionsBar";
import EmptyTableState from "./table/EmptyTableState";
import { useModerationTableSelection } from "@/hooks/useModerationTableSelection";
import { useModerationTableActions } from "@/hooks/useModerationTableActions";

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
  // Selection logic
  const {
    currentSelectedAds,
    handleSelectAll,
    handleSelectAd,
    isAllSelected,
    isSomeSelected
  } = useModerationTableSelection({
    ads,
    selectedAds,
    onSelectedAdsChange
  });

  // Actions logic
  const {
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
  } = useModerationTableActions({
    onApprove,
    onReject,
    onDelete,
    onBulkApprove,
    onBulkDelete,
    onSelectedAdsChange
  });
  
  // Add debug logging
  useEffect(() => {
    console.log(`ModerationTable (${status}) updated:`, {
      adsCount: ads?.length || 0,
      isLoading
    });
  }, [ads, status, isLoading]);
  
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
          onBulkApprove={status === "pending" ? () => handleBulkApprove(currentSelectedAds) : undefined}
          onBulkDelete={(status === "rejected" || status === "approved") ? () => handleBulkDelete(currentSelectedAds) : undefined}
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
          onClose={closeRejectDialog}
          onReject={handleRejectConfirm}
        />
      )}
    </>
  );
};

export default ModerationTable;
