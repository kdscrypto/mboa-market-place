
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usePremiumExpiration } from '@/hooks/usePremiumExpiration';

const PremiumExpirationManager: React.FC = () => {
  const { isChecking, lastCheck, checkExpiredAds } = usePremiumExpiration();

  const handleManualCheck = async () => {
    await checkExpiredAds();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Gestion des Expirations Premium
        </CardTitle>
        <CardDescription>
          Surveillance et conversion automatique des annonces premium expirées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">État du système</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Actif
              </Badge>
              <span className="text-xs text-muted-foreground">
                Vérification automatique toutes les 30 minutes
              </span>
            </div>
          </div>
          <Button 
            onClick={handleManualCheck} 
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Vérifier maintenant
              </>
            )}
          </Button>
        </div>

        {lastCheck && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Dernière vérification</p>
            <p className="text-xs text-muted-foreground">
              {lastCheck.toLocaleString('fr-FR', {
                dateStyle: 'short',
                timeStyle: 'medium'
              })}
            </p>
          </div>
        )}

        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Fonctionnement automatique :</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Les annonces premium sont automatiquement converties en annonces standard après expiration</li>
                <li>Les vérifications s'effectuent toutes les 30 minutes en arrière-plan</li>
                <li>Tous les événements sont enregistrés dans les logs d'audit</li>
                <li>Aucune intervention manuelle n'est requise</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumExpirationManager;
