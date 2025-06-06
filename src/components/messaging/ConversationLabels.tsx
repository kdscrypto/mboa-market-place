
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  getConversationLabels, 
  removeConversationLabel 
} from "@/services/messaging/conversationManagementService";

interface ConversationLabel {
  id: string;
  label_name: string;
  label_color: string;
}

interface ConversationLabelsProps {
  conversationId: string;
  onUpdate?: () => void;
}

const ConversationLabels: React.FC<ConversationLabelsProps> = ({
  conversationId,
  onUpdate
}) => {
  const [labels, setLabels] = useState<ConversationLabel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLabels();
  }, [conversationId]);

  const loadLabels = async () => {
    try {
      const labelsData = await getConversationLabels(conversationId);
      setLabels(labelsData);
    } catch (error) {
      console.error("Erreur lors du chargement des étiquettes:", error);
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    setLoading(true);
    try {
      const { success, error } = await removeConversationLabel(labelId);
      
      if (success) {
        toast.success("Étiquette supprimée");
        await loadLabels();
        onUpdate?.();
      } else {
        toast.error(error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {labels.map((label) => (
        <Badge
          key={label.id}
          variant="secondary"
          className="text-xs flex items-center gap-1 px-2 py-1"
          style={{ backgroundColor: label.label_color + '20', color: label.label_color }}
        >
          {label.label_name}
          <Button
            variant="ghost"
            size="sm"
            className="h-3 w-3 p-0 hover:bg-transparent"
            onClick={() => handleRemoveLabel(label.id)}
            disabled={loading}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default ConversationLabels;
