
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, 
  Trophy, 
  Target,
  Zap,
  Star,
  Medal,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Flame,
  Award,
  Shield,
  Swords
} from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  reward_points: number;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'locked';
  time_left?: string;
  special_reward?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  progress: number;
  required: number;
  reward_points: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  badge: string;
  streak: number;
}

interface AffiliateGamificationHubProps {
  stats: AffiliateStats;
  eliteData: any;
}

const AffiliateGamificationHub: React.FC<AffiliateGamificationHubProps> = ({ 
  stats, 
  eliteData 
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    initializeGamificationData();
  }, [stats]);

  const initializeGamificationData = () => {
    // Générer les défis dynamiques
    const activeChallenges: Challenge[] = [
      {
        id: 'daily_referral',
        title: 'Recruteur Quotidien',
        description: 'Parrainer 1 nouvelle personne aujourd\'hui',
        type: 'daily',
        difficulty: 'easy',
        reward_points: 10,
        progress: 0,
        target: 1,
        status: 'active',
        time_left: '18h 45m'
      },
      {
        id: 'weekly_network',
        title: 'Bâtisseur de Réseau',
        description: 'Atteindre 5 parrainages cette semaine',
        type: 'weekly',
        difficulty: 'medium',
        reward_points: 50,
        progress: Math.min(5, stats.level_1_referrals),
        target: 5,
        status: stats.level_1_referrals >= 5 ? 'completed' : 'active',
        time_left: '4j 12h'
      },
      {
        id: 'monthly_master',
        title: 'Maître de l\'Affiliation',
        description: 'Gagner 200 points ce mois-ci',
        type: 'monthly',
        difficulty: 'hard',
        reward_points: 100,
        progress: Math.min(200, stats.total_points),
        target: 200,
        status: stats.total_points >= 200 ? 'completed' : 'active',
        time_left: '12j 8h',
        special_reward: 'Badge exclusif "Master"'
      },
      {
        id: 'special_elite',
        title: 'Défi Elite Diamant',
        description: 'Construire un réseau de 25 personnes',
        type: 'special',
        difficulty: 'extreme',
        reward_points: 500,
        progress: stats.level_1_referrals + stats.level_2_referrals,
        target: 25,
        status: (stats.level_1_referrals + stats.level_2_referrals) >= 25 ? 'completed' : 'active',
        special_reward: 'Statut VIP à vie'
      }
    ];

    // Générer les achievements
    const gameAchievements: Achievement[] = [
      {
        id: 'first_referral',
        title: 'Premier Pas',
        description: 'Effectuer votre premier parrainage',
        icon: '🎯',
        tier: 'bronze',
        unlocked: stats.level_1_referrals > 0,
        progress: Math.min(1, stats.level_1_referrals),
        required: 1,
        reward_points: 5
      },
      {
        id: 'network_builder',
        title: 'Bâtisseur de Réseau',
        description: 'Parrainer 10 personnes',
        icon: '🏗️',
        tier: 'silver',
        unlocked: stats.level_1_referrals >= 10,
        progress: Math.min(10, stats.level_1_referrals),
        required: 10,
        reward_points: 25
      },
      {
        id: 'point_collector',
        title: 'Collectionneur de Points',
        description: 'Accumuler 100 points',
        icon: '💎',
        tier: 'gold',
        unlocked: stats.total_points >= 100,
        progress: Math.min(100, stats.total_points),
        required: 100,
        reward_points: 50
      },
      {
        id: 'elite_champion',
        title: 'Champion Elite',
        description: 'Atteindre le niveau Elite 5',
        icon: '👑',
        tier: 'platinum',
        unlocked: eliteData?.elite_level >= 5,
        progress: Math.min(5, eliteData?.elite_level || 0),
        required: 5,
        reward_points: 100
      },
      {
        id: 'legend_master',
        title: 'Maître Légendaire',
        description: 'Construire un réseau de 50+ personnes',
        icon: '⚡',
        tier: 'diamond',
        unlocked: (stats.level_1_referrals + stats.level_2_referrals) >= 50,
        progress: Math.min(50, stats.level_1_referrals + stats.level_2_referrals),
        required: 50,
        reward_points: 250
      }
    ];

    // Générer le leaderboard
    const gameLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        username: 'AffiliateKing',
        points: 1250,
        level: 8,
        badge: '👑',
        streak: 15
      },
      {
        rank: 2,
        username: 'NetworkMaster',
        points: 980,
        level: 7,
        badge: '💎',
        streak: 12
      },
      {
        rank: 3,
        username: 'EliteRecruiter',
        points: 850,
        level: 6,
        badge: '🏆',
        streak: 8
      },
      {
        rank: 4,
        username: 'Vous',
        points: stats.total_points,
        level: eliteData?.elite_level || 1,
        badge: eliteData?.elite_level >= 5 ? '⭐' : '🎯',
        streak: 5
      },
      {
        rank: 5,
        username: 'ProAffiliator',
        points: 650,
        level: 5,
        badge: '🎖️',
        streak: 7
      }
    ].sort((a, b) => b.points - a.points).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    setChallenges(activeChallenges);
    setAchievements(gameAchievements);
    setLeaderboard(gameLeaderboard);
    setCurrentStreak(Math.floor(Math.random() * 10) + 1);
    setPlayerLevel(eliteData?.elite_level || 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-600';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-purple-500';
      case 'diamond': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const claimReward = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && challenge.status === 'completed') {
      toast({
        title: "🎉 Récompense réclamée !",
        description: `Vous avez gagné ${challenge.reward_points} points !`,
        duration: 4000
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statut joueur */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Niveau Elite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {playerLevel}
            </div>
            <p className="text-xs text-muted-foreground">
              Master Level
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Série Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentStreak}
            </div>
            <p className="text-xs text-muted-foreground">
              jours consécutifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            <p className="text-xs text-muted-foreground">
              débloqués
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Défis Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {challenges.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Défis et missions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Défis & Missions
          </CardTitle>
          <CardDescription>
            Complétez des défis pour gagner des points et débloquer des récompenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`p-4 border rounded-lg ${
                  challenge.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      {challenge.type === 'special' && <Star className="h-4 w-4 text-yellow-500" />}
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    {challenge.time_left && (
                      <span className="text-xs text-gray-500">{challenge.time_left}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progression</span>
                    <span>{challenge.progress}/{challenge.target}</span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.target) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{challenge.reward_points} points</span>
                    {challenge.special_reward && (
                      <Badge variant="outline" className="text-xs">
                        +{challenge.special_reward}
                      </Badge>
                    )}
                  </div>
                  
                  {challenge.status === 'completed' ? (
                    <Button 
                      size="sm" 
                      onClick={() => claimReward(challenge.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Réclamer
                    </Button>
                  ) : (
                    <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                      {challenge.status === 'active' ? 'En cours' : 'Verrouillé'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Succès & Achievements
          </CardTitle>
          <CardDescription>
            Débloquez des achievements pour prouver votre expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 border rounded-lg ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{achievement.title}</h5>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  <Medal className={`h-4 w-4 ${getTierColor(achievement.tier)}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progression</span>
                    <span>{achievement.progress}/{achievement.required}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.required) * 100} 
                    className="h-1"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className={`text-xs ${getTierColor(achievement.tier)}`}>
                    {achievement.tier}
                  </Badge>
                  <span className="text-xs font-medium">+{achievement.reward_points}pts</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement Elite
          </CardTitle>
          <CardDescription>
            Comparez-vous aux meilleurs affiliés de la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.username === 'Vous' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className={`font-bold text-lg ${
                  entry.rank === 1 ? 'text-yellow-600' :
                  entry.rank === 2 ? 'text-gray-500' :
                  entry.rank === 3 ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  #{entry.rank}
                </div>
                
                <div className="text-xl">{entry.badge}</div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">{entry.username}</div>
                  <div className="text-xs text-gray-600">
                    Niveau {entry.level} • Série {entry.streak}j
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-sm">{entry.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateGamificationHub;
