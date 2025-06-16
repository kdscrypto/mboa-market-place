
import { AffiliateStats } from "@/services/affiliateService";
import { Challenge, Achievement, LeaderboardEntry } from "../types/gamificationTypes";

export const generateChallenges = (stats: AffiliateStats): Challenge[] => {
  return [
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
};

export const generateAchievements = (stats: AffiliateStats, eliteData: any): Achievement[] => {
  return [
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
};

export const generateLeaderboard = (stats: AffiliateStats, eliteData: any): LeaderboardEntry[] => {
  const leaderboard: LeaderboardEntry[] = [
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
  ];

  return leaderboard.sort((a, b) => b.points - a.points).map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};
