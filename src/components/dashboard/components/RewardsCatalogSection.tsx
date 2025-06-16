
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Zap } from "lucide-react";
import { Reward } from "../types/rewardsTypes";

interface RewardsCatalogSectionProps {
  rewards: Reward[];
  availablePoints: number;
  eliteLevel: number;
  onClaimReward: (rewardId: string) => void;
}

const RewardsCatalogSection: React.FC<RewardsCatalogSectionProps> = ({ 
  rewards, 
  availablePoints, 
  eliteLevel, 
  onClaimReward 
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'border-orange-300 bg-orange-50';
      case 'silver': return 'border-gray-300 bg-gray-50';
      case 'gold': return 'border-yellow-300 bg-yellow-50';
      case 'platinum': return 'border-purple-300 bg-purple-50';
      case 'diamond': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'exclusive': return 'bg-purple-100 text-purple-800';
      case 'sold_out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAfford = (cost: number) => {
    return availablePoints >= cost;
  };

  const canAccess = (reward: Reward) => {
    if (reward.required_level && eliteLevel < reward.required_level) {
      return false;
    }
    return reward.availability !== 'sold_out';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Catalogue de Récompenses
        </CardTitle>
        <CardDescription>
          Échangez vos points contre des récompenses exclusives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-4 border rounded-lg ${getTierColor(reward.tier)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{reward.image_icon}</div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={getAvailabilityColor(reward.availability)}>
                    {reward.availability}
                  </Badge>
                  {reward.time_limited && (
                    <span className="text-xs text-red-600">⏰ Limité</span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-sm">{reward.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{reward.description}</p>
                <div className="text-sm font-semibold text-blue-600 mt-1">
                  Valeur: {reward.value}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{reward.cost} points</span>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onClaimReward(reward.id)}
                  disabled={!canAfford(reward.cost) || !canAccess(reward)}
                  className={
                    canAfford(reward.cost) && canAccess(reward)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  {!canAccess(reward) ? (
                    reward.required_level ? `Niveau ${reward.required_level} requis` : 'Indisponible'
                  ) : !canAfford(reward.cost) ? (
                    'Pas assez de points'
                  ) : (
                    'Échanger'
                  )}
                </Button>
              </div>

              {reward.expires_at && (
                <div className="text-xs text-red-600 mt-2">
                  Expire le {reward.expires_at}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsCatalogSection;
