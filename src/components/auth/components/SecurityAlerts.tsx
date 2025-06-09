
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock, Info, CheckCircle } from "lucide-react";

interface SecurityAlertsProps {
  isBlocked: boolean;
  blockEndTime: Date | null;
  attemptCount?: number;
  showRecommendations?: boolean;
  recommendations?: string[];
}

const SecurityAlerts = ({ 
  isBlocked, 
  blockEndTime, 
  attemptCount = 0,
  showRecommendations = false,
  recommendations = []
}: SecurityAlertsProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!blockEndTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const remaining = blockEndTime.getTime() - now.getTime();
      
      if (remaining <= 0) {
        setTimeRemaining("");
        return;
      }

      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [blockEndTime]);

  // Alertes de sécurité normales
  if (!isBlocked && attemptCount === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <p>Connexion sécurisée avec protection anti-abus activée.</p>
            {showRecommendations && recommendations.length > 0 && (
              <div className="text-sm">
                <p className="font-medium mb-1">Recommandations de sécurité :</p>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alertes d'avertissement pour tentatives multiples
  if (!isBlocked && attemptCount > 0 && attemptCount < 5) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-2">
            <p className="font-medium">
              Attention : {attemptCount} tentative{attemptCount > 1 ? 's' : ''} de connexion détectée{attemptCount > 1 ? 's' : ''}
            </p>
            <p className="text-sm">
              Après 5 tentatives échouées, votre accès sera temporairement bloqué pour des raisons de sécurité.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < attemptCount ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>{attemptCount}/5 tentatives</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerte de blocage
  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-3">
          <div>
            <p className="font-medium">Accès temporairement restreint</p>
            <p className="text-sm mt-1">
              Trop de tentatives de connexion détectées. Votre accès est temporairement bloqué pour des raisons de sécurité.
            </p>
          </div>
          
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm bg-red-100 p-2 rounded border border-red-200">
              <Clock className="h-3 w-3" />
              <span className="font-medium">Temps restant: {timeRemaining}</span>
            </div>
          )}
          
          <div className="text-sm space-y-1">
            <p className="font-medium">Que faire pendant ce temps ?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Vérifiez que vous utilisez le bon email et mot de passe</li>
              <li>Réinitialisez votre mot de passe si nécessaire</li>
              <li>Contactez le support si le problème persiste</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlerts;
