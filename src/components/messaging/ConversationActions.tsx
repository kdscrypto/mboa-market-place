
import React, { useState } from "react";
import { Archive, Pin, Tag, Flag, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  toggleConversationArchive, 
  toggleConversationPin,
  addConversationLabel 
} from "@/services/messaging/conversationManagementService";
import LabelDialog from "./LabelDialog";

interface ConversationActionsProps {
  conversationId: string;
  isArchived?: boolean;
  isPinned?: boolean;
  onUpdate?: () => void;
}

const ConversationActions: React.FC<ConversationActionsProps> = ({
  conversationId,
  isArchived = false,
  isPinned = false,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showLabelDialog, setShowLabelDialog] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    try {
      const { success, error } = await toggleConversationArchive(conversationId, !isArchived);
      
      if (success) {
        toast.success(isArchived ? "Conversation restaurée" : "Conversation archivée");
        onUpdate?.();
      } else {
        toast.error(error || "Erreur lors de l'archivage");
      }
    } catch (error) {
      toast.error("Erreur lors de l'archivage");
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async () => {
    setLoading(true);
    try {
      const { success, error } = await toggleConversationPin(conversationId, !isPinned);
      
      if (success) {
        toast.success(isPinned ? "Conversation désépinglée" : "Conversation épinglée");
        onUpdate?.();
      } else {
        toast.error(error || "Erreur lors de l'épinglage");
      }
    } catch (error) {
      toast.error("Erreur lors de l'épinglage");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async (labelName: string, labelColor: string) => {
    try {
      const { success, error } = await addConversationLabel(conversationId, labelName, labelColor);
      
      if (success) {
        toast.success("Étiquette ajoutée");
        onUpdate?.();
      } else {
        toast.error(error || "Erreur lors de l'ajout de l'étiquette");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'étiquette");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePin}>
            <Pin className="mr-2 h-4 w-4" />
            {isPinned ? "Désépingler" : "Épingler"}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setShowLabelDialog(true)}>
            <Tag className="mr-2 h-4 w-4" />
            Ajouter une étiquette
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {isArchived ? "Restaurer" : "Archiver"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LabelDialog
        isOpen={showLabelDialog}
        onClose={() => setShowLabelDialog(false)}
        onAddLabel={handleAddLabel}
      />
    </>
  );
};

export default ConversationActions;
