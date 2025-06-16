
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface PointsBalanceCardProps {
  availablePoints: number;
}

const PointsBalanceCard: React.FC<PointsBalanceCardProps> = ({ availablePoints }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-theme-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-theme-text">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Solde de Points Elite
            </h3>
            <p className="text-sm text-theme-text-secondary">Points disponibles pour les échanges</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{availablePoints}</div>
            <div className="text-sm text-theme-text-secondary">points disponibles</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsBalanceCard;
