
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLabel: (name: string, color: string) => void;
}

const LABEL_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

const LabelDialog: React.FC<LabelDialogProps> = ({
  isOpen,
  onClose,
  onAddLabel
}) => {
  const [labelName, setLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!labelName.trim()) return;
    
    onAddLabel(labelName.trim(), selectedColor);
    setLabelName("");
    setSelectedColor(LABEL_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une étiquette</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label-name">Nom de l'étiquette</Label>
            <Input
              id="label-name"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Entrez le nom de l'étiquette"
              maxLength={20}
            />
          </div>
          
          <div>
            <Label>Couleur</Label>
            <div className="flex gap-2 mt-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-gray-900" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!labelName.trim()}>
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LabelDialog;
