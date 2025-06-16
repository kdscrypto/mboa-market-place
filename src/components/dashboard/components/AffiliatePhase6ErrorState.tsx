
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const AffiliatePhase6ErrorState: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Card className="bg-theme-surface border border-theme-border">
      <CardContent className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-theme-text">
              Erreur de chargement
            </h3>
            <p className="text-theme-text-secondary max-w-md">
              Impossible de charger les données d'affiliation. Veuillez vérifier votre connexion et réessayer.
            </p>
          </div>
          
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="mt-4 border-theme-border text-theme-text hover:bg-theme-surface-elevated"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliatePhase6ErrorState;
