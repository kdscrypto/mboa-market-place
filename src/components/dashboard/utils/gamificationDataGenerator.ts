
import { AffiliateStats } from "@/services/affiliateService";
import { Challenge, Achievement, LeaderboardEntry } from "../types/gamificationTypes";

export const generateChallenges = (stats: AffiliateStats): Challenge[] => {
  const challenges: Challenge[] = [];
  const totalReferrals = stats.level_1_referrals + stats.level_2_referrals;
  
  // Challenge 1: First referral for new users
  if (stats.level_1_referrals === 0) {
    challenges.push({
      id: 'first_referral',
      title: 'Premier Parrainage',
      description: 'Obtenez votre premier parrainage',
      type: 'milestone',
      difficulty: 'easy',
      reward_points: 10,
      progress: 0,
      target: 1,
      status: 'active',
      time_left: 'Pas de limite'
    });
  }
  
  // Challenge 2: Reach next referral milestone
  if (stats.level_1_referrals > 0 && stats.level_1_referrals < 5) {
    challenges.push({
      id: 'reach_5_referrals',
      title: 'Réseau de Base',
      description: 'Atteignez 5 parrainages directs',
      type: 'milestone',
      difficulty: 'medium',
      reward_points: 25,
      progress: stats.level_1_referrals,
      target: 5,
      status: 'active',
      time_left: 'Objectif mensuel'
    });
  } else if (stats.level_1_referrals >= 5 && stats.level_1_referrals < 10) {
    challenges.push({
      id: 'reach_10_referrals',
      title: 'Réseau Établi',
      description: 'Développez votre réseau à 10 parrainages',
      type: 'milestone',
      difficulty: 'medium',
      reward_points: 50,
      progress: stats.level_1_referrals,
      target: 10,
      status: 'active',
      time_left: 'Objectif trimestriel'
    });
  }
  
  // Challenge 3: Points milestone
  if (stats.total_points < 100) {
    challenges.push({
      id: 'reach_100_points',
      title: 'Collectionneur de Points',
      description: 'Accumulez 100 points d\'affiliation',
      type: 'milestone',
      difficulty: 'medium',
      reward_points: 20,
      progress: stats.total_points,
      target: 100,
      status: 'active',
      time_left: 'Objectif mensuel'
    });
  }
  
  // Challenge 4: Level 2 network development
  if (stats.level_1_referrals >= 2 && stats.level_2_referrals === 0) {
    challenges.push({
      id: 'first_level_2',
      title: 'Réseau Niveau 2',
      description: 'Obtenez votre premier parrainage de niveau 2',
      type: 'milestone',
      difficulty: 'hard',
      reward_points: 15,
      progress: stats.level_2_referrals,
      target: 1,
      status: 'active',
      time_left: 'Objectif hebdomadaire'
    });
  }
  
  return challenges;
};

export const generateAchievements = (stats: AffiliateStats, eliteData: any): Achievement[] => {
  const totalReferrals = stats.level_1_referrals + stats.level_2_referrals;
  
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
      title: 'Constructeur de Réseau',
      description: 'Parrainer 5 personnes',
      icon: '🏗️',
      tier: 'silver',
      unlocked: stats.level_1_referrals >= 5,
      progress: Math.min(5, stats.level_1_referrals),
      required: 5,
      reward_points: 15
    },
    {
      id: 'point_collector',
      title: 'Collectionneur de Points',
      description: 'Accumuler 50 points',
      icon: '💎',
      tier: 'silver',
      unlocked: stats.total_points >= 50,
      progress: Math.min(50, stats.total_points),
      required: 50,
      reward_points: 25
    },
    {
      id: 'network_master',
      title: 'Maître du Réseau',
      description: 'Atteindre 10 parrainages directs',
      icon: '👑',
      tier: 'gold',
      unlocked: stats.level_1_referrals >= 10,
      progress: Math.min(10, stats.level_1_referrals),
      required: 10,
      reward_points: 50
    },
    {
      id: 'elite_champion',
      title: 'Champion Elite',
      description: 'Accumuler 200 points',
      icon: '⚡',
      tier: 'platinum',
      unlocked: stats.total_points >= 200,
      progress: Math.min(200, stats.total_points),
      required: 200,
      reward_points: 100
    }
  ];
};

export const generateLeaderboard = (stats: AffiliateStats, eliteData: any): LeaderboardEntry[] => {
  // Create a realistic leaderboard with the user's actual position
  // In a real app, this would come from the database
  const userEntry: LeaderboardEntry = {
    rank: Math.max(1, Math.ceil((100 - stats.total_points) / 10)), // Estimated rank based on points
    username: 'Vous',
    points: stats.total_points,
    level: eliteData?.elite_level || 1,
    badge: stats.total_points >= 100 ? '⭐' : stats.total_points >= 50 ? '🎯' : '🌟',
    streak: Math.floor(stats.total_points / 10) // Estimated streak
  };
  
  // Generate some realistic entries around the user
  const leaderboard: LeaderboardEntry[] = [userEntry];
  
  // Add entries above the user
  for (let i = 1; i < userEntry.rank; i++) {
    leaderboard.push({
      rank: i,
      username: `Affilié ${i}`,
      points: stats.total_points + (userEntry.rank - i) * 25,
      level: Math.ceil((stats.total_points + (userEntry.rank - i) * 25) / 100),
      badge: '🏆',
      streak: 10 + i
    });
  }
  
  // Add entries below the user
  for (let i = userEntry.rank + 1; i <= Math.min(userEntry.rank + 3, 10); i++) {
    leaderboard.push({
      rank: i,
      username: `Affilié ${i}`,
      points: Math.max(0, stats.total_points - (i - userEntry.rank) * 15),
      level: Math.max(1, Math.ceil((stats.total_points - (i - userEntry.rank) * 15) / 100)),
      badge: '🎖️',
      streak: Math.max(1, 10 - i)
    });
  }
  
  return leaderboard.sort((a, b) => a.rank - b.rank);
};
