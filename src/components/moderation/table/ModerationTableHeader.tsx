
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ModerationTableHeaderProps {
  showBulkActions: boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

const ModerationTableHeader: React.FC<ModerationTableHeaderProps> = ({
  showBulkActions,
  isAllSelected,
  isSomeSelected,
  onSelectAll
}) => {
  return (
    <TableHeader>
      <TableRow>
        {showBulkActions && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className={isSomeSelected ? "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted" : ""}
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
  );
};

export default ModerationTableHeader;
