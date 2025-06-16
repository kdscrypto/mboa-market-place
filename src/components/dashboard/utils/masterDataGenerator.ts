import { AffiliateStats } from "@/services/affiliateService";

export interface MasterMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  description: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  progress: number;
  type: 'performance' | 'network' | 'efficiency' | 'innovation' | 'achievement' | 'consistency';
}

export interface EliteGoal {
  id: string;
  title: string;
  description: string;
  current_value: number;
  target_value: number;
  unit: string;
  category: 'growth' | 'influence' | 'innovation' | 'community';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  reward: string;
}

export interface PerformanceInsight {
  id: string;
  title: string;
  insight: string;
  action_required: boolean;
  impact_level: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  data_source: string;
}

export const generateMasterMetrics = (stats: AffiliateStats): MasterMetric[] => {
  // Calculate metrics based only on real data
  const totalReferrals = stats.level_1_referrals + stats.level_2_referrals;
  const conversionRate = totalReferrals > 0 ? Math.min(100, (stats.level_1_referrals / totalReferrals) * 100) : 0;
  const networkStrength = Math.min(100, (stats.level_1_referrals * 10) + (stats.level_2_referrals * 5));
  const activityScore = Math.min(100, stats.total_points * 2);
  
  return [
    {
      id: 'total_points',
      title: 'Points Totaux',
      value: stats.total_points,
      unit: 'pts',
      description: 'Points d\'affiliation accumulés',
      change: '0%', // Real change would need historical data
      trend: 'stable' as const,
      progress: Math.min(100, stats.total_points / 5), // Progress out of 500 points max
      type: 'performance' as const
    },
    {
      id: 'network_size',
      title: 'Taille du Réseau',
      value: totalReferrals,
      unit: 'membres',
      description: 'Nombre total de parrainages',
      change: '0%',
      trend: 'stable' as const,
      progress: Math.min(100, totalReferrals * 4), // Progress out of 25 referrals max
      type: 'network' as const
    },
    {
      id: 'conversion_rate',
      title: 'Taux de Conversion',
      value: Math.round(conversionRate),
      unit: '%',
      description: 'Parrainages niveau 1 / Total',
      change: '0%',
      trend: 'stable' as const,
      progress: conversionRate,
      type: 'efficiency' as const
    },
    {
      id: 'network_strength',
      title: 'Force du Réseau',
      value: Math.round(networkStrength),
      unit: '/100',
      description: 'Impact de votre réseau',
      change: '0%',
      trend: 'stable' as const,
      progress: networkStrength,
      type: 'achievement' as const
    }
  ];
};

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

// Simplified, real data only - no more fictitious tools
export const generateMasterTools = (stats: AffiliateStats) => {
  // Return empty array or basic tools based on actual user level
  const tools = [];
  
  if (stats.total_points >= 50) {
    tools.push({
      id: 'basic_analytics',
      name: 'Statistiques de Base',
      description: 'Consultez vos statistiques d\'affiliation détaillées',
      category: 'analytics',
      usage_level: 100, // Always available once unlocked
      efficiency_gain: 'Suivi en temps réel',
      premium_feature: false,
      icon: '📊'
    });
  }
  
  if (stats.total_points >= 100) {
    tools.push({
      id: 'share_links',
      name: 'Liens de Partage',
      description: 'Outils avancés de partage de votre code d\'affiliation',
      category: 'automation',
      usage_level: 100,
      efficiency_gain: 'Partage facilité',
      premium_feature: false,
      icon: '🔗'
    });
  }
  
  return tools;
};

// Simplified insights based on real performance
export const generatePerformanceInsights = (stats: AffiliateStats): PerformanceInsight[] => {
  const insights: PerformanceInsight[] = [];
  const totalReferrals = stats.level_1_referrals + stats.level_2_referrals;
  
  if (stats.level_1_referrals === 0) {
    insights.push({
      id: 'first_referral',
      title: 'Premier Parrainage',
      insight: 'Commencez par partager votre code d\'affiliation avec vos proches pour obtenir votre premier parrainage.',
      action_required: true,
      impact_level: 'high',
      category: 'Démarrage',
      data_source: 'Analyse de Performance'
    });
  }
  
  if (stats.level_1_referrals > 0 && stats.level_2_referrals === 0) {
    insights.push({
      id: 'second_level',
      title: 'Développer le Niveau 2',
      insight: 'Encouragez vos filleuls à parrainer à leur tour pour développer votre réseau de niveau 2.',
      action_required: true,
      impact_level: 'medium',
      category: 'Croissance',
      data_source: 'Analyse de Réseau'
    });
  }
  
  if (totalReferrals >= 5) {
    insights.push({
      id: 'good_progress',
      title: 'Excellents Progrès',
      insight: `Avec ${totalReferrals} parrainages, vous êtes sur la bonne voie ! Continuez à partager activement.`,
      action_required: false,
      impact_level: 'low',
      category: 'Encouragement',
      data_source: 'Analyse de Performance'
    });
  }
  
  if (insights.length === 0) {
    insights.push({
      id: 'get_started',
      title: 'Commencer',
      insight: 'Partagez votre code d\'affiliation pour commencer à développer votre réseau et gagner des points.',
      action_required: true,
      impact_level: 'high',
      category: 'Démarrage',
      data_source: 'Guide d\'Utilisation'
    });
  }
  
  return insights;
};
