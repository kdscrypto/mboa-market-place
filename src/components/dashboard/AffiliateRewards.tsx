
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Target, Gift, Zap } from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";

interface AffiliateRewardsProps {
  stats: AffiliateStats;
}

const AffiliateRewards: React.FC<AffiliateRewardsProps> = ({ stats }) => {
  const rewards = [
    {
      id: "first_referral",
      name: "Premier parrainage",
      description: "Votre premier filleul inscrit",
      icon: Star,
      requirement: 1,
      current: stats.level_1_referrals,
      completed: stats.level_1_referrals >= 1,
      type: "bronze"
    },
    {
      id: "five_referrals",
      name: "Recruteur",
      description: "5 parrainages directs",
      icon: Target,
      requirement: 5,
      current: stats.level_1_referrals,
      completed: stats.level_1_referrals >= 5,
      type: "silver"
    },
    {
      id: "ten_referrals",
      name: "Ambassadeur",
      description: "10 parrainages directs",
      icon: Trophy,
      requirement: 10,
      current: stats.level_1_referrals,
      completed: stats.level_1_referrals >= 10,
      type: "gold"
    },
    {
      id: "network_builder",
      name: "Bâtisseur de réseau",
      description: "5 parrainages de niveau 2",
      icon: Crown,
      requirement: 5,
      current: stats.level_2_referrals,
      completed: stats.level_2_referrals >= 5,
      type: "gold"
    },
    {
      id: "points_collector",
      name: "Collectionneur",
      description: "50 points au total",
      icon: Gift,
      requirement: 50,
      current: stats.total_earned,
      completed: stats.total_earned >= 50,
      type: "silver"
    },
    {
      id: "super_affiliate",
      name: "Super Affilié",
      description: "100 points au total",
      icon: Zap,
      requirement: 100,
      current: stats.total_earned,
      completed: stats.total_earned >= 100,
      type: "diamond"
    }
  ];

  const getRewardColor = (type: string, completed: boolean) => {
    if (!completed) return "text-gray-400";
    
    switch (type) {
      case "bronze": return "text-amber-600";
      case "silver": return "text-gray-500";
      case "gold": return "text-yellow-500";
      case "diamond": return "text-purple-500";
      default: return "text-blue-500";
    }
  };

  const getRewardBadge = (type: string, completed: boolean) => {
    if (!completed) return "outline";
    
    switch (type) {
      case "bronze": return "secondary";
      case "silver": return "secondary";
      case "gold": return "default";
      case "diamond": return "default";
      default: return "outline";
    }
  };

  const completedRewards = rewards.filter(r => r.completed).length;
  const totalRewards = rewards.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Récompenses et badges
        </CardTitle>
        <CardDescription>
          Débloquez des badges en atteignant vos objectifs de parrainage
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{completedRewards}/{totalRewards} badges</span>
          </div>
          <Progress value={(completedRewards / totalRewards) * 100} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {rewards.map((reward) => {
            const Icon = reward.icon;
            const progress = Math.min((reward.current / reward.requirement) * 100, 100);
            
            return (
              <div
                key={reward.id}
                className={`p-4 border rounded-lg transition-all ${
                  reward.completed 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`h-6 w-6 ${getRewardColor(reward.type, reward.completed)}`} />
                  <Badge variant={getRewardBadge(reward.type, reward.completed)} className="text-xs">
                    {reward.completed ? "Débloqué" : "En cours"}
                  </Badge>
                </div>
                
                <h4 className="font-medium text-sm mb-1">{reward.name}</h4>
                <p className="text-xs text-gray-600 mb-3">{reward.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progression</span>
                    <span>{reward.current}/{reward.requirement}</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateRewards;
