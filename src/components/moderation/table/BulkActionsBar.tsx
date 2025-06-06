
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Trash2 } from "lucide-react";

interface BulkActionsBarProps {
  status: "pending" | "approved" | "rejected";
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onBulkApprove?: () => void;
  onBulkDelete?: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  status,
  selectedCount,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  onBulkApprove,
  onBulkDelete
}) => {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
          className={isSomeSelected ? "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted" : ""}
        />
        <span className="text-sm text-gray-600">
          {selectedCount > 0 ? `${selectedCount} sélectionnée(s)` : "Tout sélectionner"}
        </span>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex gap-2">
          {status === "pending" && onBulkApprove && (
            <Button
              onClick={onBulkApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              Approuver ({selectedCount})
            </Button>
          )}
          
          {status === "rejected" && onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({selectedCount})
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActionsBar;
