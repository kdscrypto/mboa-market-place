
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Gift, Share2, TrendingUp } from "lucide-react";

const AffiliateNotifications: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu la notification
    const hasSeenNotification = localStorage.getItem('affiliate-phase2-notification');
    if (!hasSeenNotification) {
      setShowNotification(true);
    }
  }, []);

  const dismissNotification = () => {
    setShowNotification(false);
    localStorage.setItem('affiliate-phase2-notification', 'true');
  };

  if (!showNotification) return null;

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white rounded-full p-2">
              <Gift className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-900">
                🎉 Nouvelles fonctionnalités de parrainage !
              </h3>
              <div className="space-y-1 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <Share2 className="h-3 w-3" />
                  <span>Liens de partage automatiques pour WhatsApp, email et réseaux sociaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Statistiques en temps réel avec notifications d'activité</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-3 w-3" />
                  <span>Intégration automatique du code depuis l'URL de parrainage</span>
                </div>
              </div>
              <p className="text-xs text-green-700 font-medium">
                Partagez dès maintenant et gagnez plus de points !
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissNotification}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateNotifications;
