
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  FileText
} from "lucide-react";

interface QuickActionsProps {
  pendingCount: number;
  onBulkApprove?: (adIds: string[]) => void;
  onBulkReject?: (adIds: string[], message: string) => void;
  selectedAds: string[];
}

const QuickActions: React.FC<QuickActionsProps> = ({
  pendingCount,
  onBulkApprove,
  onBulkReject,
  selectedAds
}) => {
  const commonRejectionReasons = [
    "Contenu inapproprié ou offensant",
    "Informations incomplètes ou incorrectes", 
    "Images de mauvaise qualité",
    "Prix non conforme au marché",
    "Annonce en double",
    "Contenu promotionnel non autorisé"
  ];

  const handleQuickReject = (reason: string) => {
    if (selectedAds.length > 0 && onBulkReject) {
      onBulkReject(selectedAds, reason);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions rapides
          {selectedAds.length > 0 && (
            <Badge variant="secondary">{selectedAds.length} sélectionnée(s)</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Actions for Selected Ads */}
        {selectedAds.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Actions en lot ({selectedAds.length} annonces)
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onBulkApprove && onBulkApprove(selectedAds)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Tout approuver
              </Button>
              
              <div className="flex flex-wrap gap-1">
                {commonRejectionReasons.slice(0, 3).map((reason, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleQuickReject(reason)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {reason.length > 20 ? `${reason.substring(0, 20)}...` : reason}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">En attente</span>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pendingCount}
            </Badge>
          </div>

          {pendingCount > 10 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Attention</span>
              </div>
              <Badge variant="destructive">
                File importante
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Efficacité</span>
            </div>
            <Badge variant="outline" className="border-blue-200 text-blue-800">
              Mode rapide
            </Badge>
          </div>
        </div>

        {/* Pre-defined Rejection Messages */}
        <div>
          <h4 className="font-medium mb-2">Messages de rejet prédéfinis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonRejectionReasons.map((reason, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => selectedAds.length > 0 && handleQuickReject(reason)}
                disabled={selectedAds.length === 0}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {reason}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
