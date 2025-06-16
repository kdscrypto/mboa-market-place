
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Gift, Clock } from "lucide-react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";

interface AffiliateRealTimeStatsProps {
  userId: string;
  initialStats: AffiliateStats;
  onStatsUpdate?: (stats: AffiliateStats) => void;
}

const AffiliateRealTimeStats: React.FC<AffiliateRealTimeStatsProps> = ({ 
  userId, 
  initialStats,
  onStatsUpdate 
}) => {
  const [stats, setStats] = useState<AffiliateStats>(initialStats);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hasNewActivity, setHasNewActivity] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newStats = await getAffiliateStats(userId);
        if (newStats) {
          // Vérifier s'il y a de nouveaux parrainages
          const hasNewReferrals = 
            newStats.total_referrals > stats.total_referrals ||
            newStats.total_points > stats.total_points;
          
          if (hasNewReferrals) {
            setHasNewActivity(true);
            setTimeout(() => setHasNewActivity(false), 5000);
          }
          
          setStats(newStats);
          setLastUpdate(new Date());
          onStatsUpdate?.(newStats);
        }
      } catch (error) {
        console.error("Error updating affiliate stats:", error);
      }
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, [userId, stats, onStatsUpdate]);

  const formatLastUpdate = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "À l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} min`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours}h`;
    }
  };

  return (
    <Card className={`transition-all duration-300 ${hasNewActivity ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Activité en temps réel
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasNewActivity && (
              <Badge variant="default" className="bg-green-500 animate-pulse">
                Nouveau !
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {formatLastUpdate()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Total parrainages</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {stats.total_referrals}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Points totaux</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {stats.total_points}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Niveau 1</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.level_1_referrals}</span>
              <Badge variant="outline" className="text-xs">+2 pts</Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Niveau 2</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stats.level_2_referrals}</span>
              <Badge variant="outline" className="text-xs">+1 pt</Badge>
            </div>
          </div>
        </div>

        {hasNewActivity && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              🎉 Nouvelle activité détectée !
            </p>
            <p className="text-xs text-green-600">
              Vos statistiques ont été mises à jour.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateRealTimeStats;
