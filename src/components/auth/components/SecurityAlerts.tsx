
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Clock } from "lucide-react";

interface SecurityAlertsProps {
  isBlocked: boolean;
  blockEndTime: Date | null;
}

const SecurityAlerts = ({ isBlocked, blockEndTime }: SecurityAlertsProps) => {
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

  if (!isBlocked) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Connexion sécurisée avec protection anti-abus activée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p className="font-medium">Accès temporairement restreint</p>
          <p className="text-sm">
            Trop de tentatives de connexion détectées. Votre accès est temporairement bloqué pour des raisons de sécurité.
          </p>
          {timeRemaining && (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              Temps restant: {timeRemaining}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SecurityAlerts;
