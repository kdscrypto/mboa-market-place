
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AffiliateHowItWorksSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comment gagner plus de points ?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
          <div>
            <p className="font-medium">Utilisez les liens de partage</p>
            <p className="text-sm text-gray-600">Partagez vos liens personnalisés sur WhatsApp, email ou réseaux sociaux</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
          <div>
            <p className="font-medium">Ils s'inscrivent avec votre code</p>
            <p className="text-sm text-gray-600">Chaque inscription avec votre code vous rapporte 2 points automatiquement</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-mboa-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
          <div>
            <p className="font-medium">Bonus niveau 2 automatique</p>
            <p className="text-sm text-gray-600">Quand vos filleuls parrainent à leur tour, vous gagnez 1 point supplémentaire</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateHowItWorksSection;
