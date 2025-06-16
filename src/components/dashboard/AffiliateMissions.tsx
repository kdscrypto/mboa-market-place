
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Gift, Clock, Star, Zap, Users, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AffiliateStats } from "@/services/affiliateService";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: any;
  requirement: number;
  reward: number;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  progress: number;
  completed: boolean;
  expires_at?: string;
}

interface AffiliateMissionsProps {
  stats: AffiliateStats;
  userId: string;
}

const AffiliateMissions: React.FC<AffiliateMissionsProps> = ({ stats, userId }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateMissions();
  }, [stats]);

  const generateMissions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
    
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const allMissions: Mission[] = [
      // Missions quotidiennes
      {
        id: 'daily_share',
        title: 'Partage quotidien',
        description: 'Partagez votre lien d\'affiliation 3 fois aujourd\'hui',
        icon: Share2,
        requirement: 3,
        reward: 5,
        type: 'daily',
        progress: Math.min(3, Math.floor(Math.random() * 4)), // Simulé
        completed: false,
        expires_at: tomorrow.toISOString()
      },
      
      // Missions hebdomadaires
      {
        id: 'weekly_referrals',
        title: 'Recruteur de la semaine',
        description: 'Obtenez 5 nouveaux parrainages cette semaine',
        icon: Users,
        requirement: 5,
        reward: 25,
        type: 'weekly',
        progress: stats.level_1_referrals % 5,
        completed: false,
        expires_at: endOfWeek.toISOString()
      },
      
      // Missions mensuelles
      {
        id: 'monthly_network',
        title: 'Bâtisseur de réseau',
        description: 'Atteignez 20 parrainages ce mois-ci',
        icon: Target,
        requirement: 20,
        reward: 100,
        type: 'monthly',
        progress: stats.level_1_referrals,
        completed: stats.level_1_referrals >= 20,
        expires_at: endOfMonth.toISOString()
      },
      
      // Missions spéciales
      {
        id: 'special_points',
        title: 'Collectionneur d\'élite',
        description: 'Accumulez 500 points au total',
        icon: Star,
        requirement: 500,
        reward: 200,
        type: 'special',
        progress: stats.total_earned,
        completed: stats.total_earned >= 500,
      }
    ];

    // Marquer les missions complétées
    const updatedMissions = allMissions.map(mission => ({
      ...mission,
      completed: mission.progress >= mission.requirement
    }));

    setMissions(updatedMissions);
  };

  const claimReward = async (missionId: string) => {
    setLoading(true);
    try {
      // Simuler la réclamation de récompense
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, completed: true }
          : mission
      ));
      
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
        toast({
          title: "Récompense réclamée !",
          description: `Vous avez gagné ${mission.reward} points pour "${mission.title}"`,
          duration: 5000
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réclamer la récompense",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMissionColor = (type: Mission['type']) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-orange-100 text-orange-800';
    }
  };

  const getMissionTypeLabel = (type: Mission['type']) => {
    switch (type) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'special': return 'Spécial';
    }
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} jour${days > 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Missions et défis
        </CardTitle>
        <CardDescription>
          Complétez des missions pour gagner des points bonus
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {missions.map((mission) => {
            const Icon = mission.icon;
            const progress = Math.min((mission.progress / mission.requirement) * 100, 100);
            const timeRemaining = getTimeRemaining(mission.expires_at);
            
            return (
              <div
                key={mission.id}
                className={`p-4 border rounded-lg transition-all ${
                  mission.completed 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-mboa-orange" />
                    <Badge variant="outline" className={`text-xs ${getMissionColor(mission.type)}`}>
                      {getMissionTypeLabel(mission.type)}
                    </Badge>
                  </div>
                  {timeRemaining && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {timeRemaining}
                    </div>
                  )}
                </div>
                
                <h4 className="font-medium text-sm mb-1">{mission.title}</h4>
                <p className="text-xs text-gray-600 mb-3">{mission.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progression</span>
                      <span>{mission.progress}/{mission.requirement}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Gift className="h-3 w-3" />
                      <span>{mission.reward} points</span>
                    </div>
                    
                    {mission.completed ? (
                      <Button 
                        onClick={() => claimReward(mission.id)}
                        disabled={loading}
                        size="sm"
                        className="text-xs"
                      >
                        {loading ? "..." : "Réclamer"}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        En cours
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateMissions;
