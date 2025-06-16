
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface PointsBalanceCardProps {
  availablePoints: number;
}

const PointsBalanceCard: React.FC<PointsBalanceCardProps> = ({ availablePoints }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              Solde de Points Elite
            </h3>
            <p className="text-sm text-gray-600">Points disponibles pour les échanges</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{availablePoints}</div>
            <div className="text-sm text-gray-500">points disponibles</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsBalanceCard;
