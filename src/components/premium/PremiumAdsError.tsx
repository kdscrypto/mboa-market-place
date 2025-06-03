
import React from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumAdsErrorProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const PremiumAdsError: React.FC<PremiumAdsErrorProps> = ({ onRetry, isRetrying }) => {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Une erreur s'est produite</h3>
        <p className="mb-4 text-gray-600">Impossible de charger les annonces premium.</p>
        
        <Button 
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PremiumAdsError;
