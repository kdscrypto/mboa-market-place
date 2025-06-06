
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Ad } from "@/types/adTypes";
import AdStatusBadge from "../AdStatusBadge";
import AdActionButtons from "../AdActionButtons";

interface ModerationTableRowProps {
  ad: Ad;
  status: "pending" | "approved" | "rejected";
  showBulkActions: boolean;
  isSelected: boolean;
  onSelectAd: (adId: string, checked: boolean) => void;
  onViewClick: (ad: Ad) => void;
  onApprove?: (adId: string) => void;
  onRejectClick?: (adId: string) => void;
  onDelete?: (adId: string) => void;
}

const ModerationTableRow: React.FC<ModerationTableRowProps> = ({
  ad,
  status,
  showBulkActions,
  isSelected,
  onSelectAd,
  onViewClick,
  onApprove,
  onRejectClick,
  onDelete
}) => {
  const handleApproveClick = (adId: string) => {
    console.log("ModerationTableRow: handleApproveClick called for ad", adId);
    if (onApprove) {
      onApprove(adId);
    }
  };

  const handleRejectClick = () => {
    console.log("ModerationTableRow: handleRejectClick called for ad", ad.id);
    if (onRejectClick) {
      onRejectClick(ad.id);
    }
  };

  return (
    <TableRow key={ad.id}>
      {showBulkActions && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectAd(ad.id, checked as boolean)}
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
          onViewClick={() => onViewClick(ad)}
          onApprove={() => handleApproveClick(ad.id)}
          onRejectClick={handleRejectClick}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default ModerationTableRow;
