
import { AffiliateStats } from "@/services/affiliateService";
import { EliteGoal } from "../types/masterTypes";

export const generateEliteGoals = (stats: AffiliateStats): EliteGoal[] => {
  const totalReferrals = stats.level_1_referrals + stats.level_2_referrals;
  
  // Generate realistic goals based on current performance
  const goals: EliteGoal[] = [];
  
  // Goal 1: Increase total referrals
  if (totalReferrals < 10) {
    goals.push({
      id: 'reach_10_referrals',
      title: 'Atteindre 10 Parrainages',
      description: 'Développer votre réseau à 10 membres',
      current_value: totalReferrals,
      target_value: 10,
      unit: 'parrainages',
      category: 'growth',
      priority: 'high',
      deadline: 'Objectif mensuel',
      reward: '50 points bonus'
    });
  } else if (totalReferrals < 25) {
    goals.push({
      id: 'reach_25_referrals',
      title: 'Réseau de 25 Membres',
      description: 'Construire un réseau solide de 25 personnes',
      current_value: totalReferrals,
      target_value: 25,
      unit: 'parrainages',
      category: 'growth',
      priority: 'medium',
      deadline: 'Objectif trimestriel',
      reward: '150 points bonus'
    });
  }
  
  // Goal 2: Improve points
  if (stats.total_points < 100) {
    goals.push({
      id: 'reach_100_points',
      title: 'Collectionneur de Points',
      description: 'Accumuler 100 points d\'affiliation',
      current_value: stats.total_points,
      target_value: 100,
      unit: 'points',
      category: 'growth',
      priority: 'high',
      deadline: 'Objectif mensuel',
      reward: 'Badge Collectionneur'
    });
  } else if (stats.total_points < 500) {
    goals.push({
      id: 'reach_500_points',
      title: 'Expert en Affiliation',
      description: 'Devenir un expert avec 500 points',
      current_value: stats.total_points,
      target_value: 500,
      unit: 'points',
      category: 'growth',
      priority: 'medium',
      deadline: 'Objectif semestriel',
      reward: 'Statut Expert'
    });
  }
  
  // Goal 3: Level 1 referrals focus
  if (stats.level_1_referrals < 5) {
    goals.push({
      id: 'direct_referrals',
      title: 'Parrainages Directs',
      description: 'Obtenir 5 parrainages de niveau 1',
      current_value: stats.level_1_referrals,
      target_value: 5,
      unit: 'parrainages directs',
      category: 'influence',
      priority: 'high',
      deadline: 'Objectif hebdomadaire',
      reward: '25 points bonus'
    });
  }
  
  // If no goals are applicable, show a completion message
  if (goals.length === 0) {
    goals.push({
      id: 'master_affiliate',
      title: 'Maître Affilié',
      description: 'Félicitations ! Vous avez atteint un excellent niveau',
      current_value: 100,
      target_value: 100,
      unit: '%',
      category: 'community',
      priority: 'low',
      deadline: 'Objectif atteint',
      reward: 'Statut Master'
    });
  }
  
  return goals;
};
