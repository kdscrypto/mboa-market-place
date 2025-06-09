
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Gift, Zap } from 'lucide-react';

const MigrationCompletionBanner: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              🎉 Migration Monetbil terminée avec succès !
            </h2>
            
            <p className="text-green-700 mb-4">
              La suppression complète de Monetbil a été effectuée. Votre plateforme fonctionne maintenant 
              entièrement avec des annonces gratuites.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-green-700">
                <Gift className="h-5 w-5" />
                <span className="text-sm font-medium">Toutes les annonces sont gratuites</span>
              </div>
              
              <div className="flex items-center gap-2 text-green-700">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">Interface simplifiée</span>
              </div>
              
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Système sécurisé</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <h3 className="font-medium text-green-800 mb-1">Avantages pour vos utilisateurs :</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Publication d'annonces 100% gratuite</li>
                <li>• Processus simplifié sans étapes de paiement</li>
                <li>• Expérience utilisateur améliorée</li>
                <li>• Pas de gestion de transactions complexes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationCompletionBanner;
