
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star } from "lucide-react";
import { ElitePerks } from "../types/rewardsTypes";
import { AffiliateStats } from "@/services/affiliateService";

interface ElitePerksSectionProps {
  elitePerks: ElitePerks[];
  stats: AffiliateStats;
}

const ElitePerksSection: React.FC<ElitePerksSectionProps> = ({ elitePerks, stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Avantages Elite
        </CardTitle>
        <CardDescription>
          Privilèges exclusifs débloqués selon votre niveau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {elitePerks.map((perk) => (
            <div
              key={perk.id}
              className={`p-4 border rounded-lg ${
                perk.unlocked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`text-2xl ${perk.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {perk.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{perk.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{perk.description}</p>
                </div>
                <Badge variant={perk.unlocked ? 'default' : 'secondary'}>
                  {perk.unlocked ? 'Débloqué' : `${perk.required_points} pts`}
                </Badge>
              </div>

              {perk.unlocked && (
                <div className="space-y-1">
                  {perk.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                      <Star className="h-3 w-3" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              )}

              {!perk.unlocked && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progression</span>
                    <span>{Math.min(perk.required_points, stats.total_points)}/{perk.required_points}</span>
                  </div>
                  <Progress 
                    value={(Math.min(perk.required_points, stats.total_points) / perk.required_points) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElitePerksSection;
