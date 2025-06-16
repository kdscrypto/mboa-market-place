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

export interface MasterMetrics {
  elite_score: number;
  network_influence: number;
  community_contribution: number;
  innovation_index: number;
  leadership_rating: number;
  consistency_score: number;
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

export interface MasterTool {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'automation' | 'optimization' | 'community';
  usage_level: number;
  efficiency_gain: string;
  premium_feature: boolean;
  icon: string;
}

export interface PerformanceInsight {
  id: string;
  title: string;
  insight: string;
  action_required: boolean;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data_source: string;
}

export const generateMasterMetrics = (stats: AffiliateStats): MasterMetric[] => {
  const metricsData = {
    elite_score: Math.min(100, 65 + (stats.total_points / 20)),
    network_influence: Math.min(100, 70 + (stats.level_1_referrals * 2)),
    community_contribution: Math.floor(Math.random() * 30) + 70,
    innovation_index: Math.floor(Math.random() * 25) + 75,
    leadership_rating: Math.min(100, 60 + (stats.total_points / 15)),
    consistency_score: Math.floor(Math.random() * 20) + 80
  };

  return [
    {
      id: 'elite_score',
      title: 'Score Elite Master',
      value: metricsData.elite_score,
      unit: '/100',
      description: 'Performance globale elite',
      change: '+12%',
      trend: 'up' as const,
      progress: metricsData.elite_score,
      type: 'performance' as const
    },
    {
      id: 'network_influence',
      title: 'Influence Réseau',
      value: metricsData.network_influence,
      unit: '/100',
      description: 'Impact sur la communauté',
      change: '+8%',
      trend: 'up' as const,
      progress: metricsData.network_influence,
      type: 'network' as const
    },
    {
      id: 'community_contribution',
      title: 'Contribution Communauté',
      value: metricsData.community_contribution,
      unit: '/100',
      description: 'Engagement communautaire',
      change: '+5%',
      trend: 'up' as const,
      progress: metricsData.community_contribution,
      type: 'efficiency' as const
    },
    {
      id: 'innovation_index',
      title: 'Index Innovation',
      value: metricsData.innovation_index,
      unit: '/100',
      description: 'Créativité et innovation',
      change: '+15%',
      trend: 'up' as const,
      progress: metricsData.innovation_index,
      type: 'innovation' as const
    },
    {
      id: 'leadership_rating',
      title: 'Rating Leadership',
      value: metricsData.leadership_rating,
      unit: '/100',
      description: 'Capacités de leadership',
      change: '+7%',
      trend: 'up' as const,
      progress: metricsData.leadership_rating,
      type: 'achievement' as const
    },
    {
      id: 'consistency_score',
      title: 'Score Consistance',
      value: metricsData.consistency_score,
      unit: '/100',
      description: 'Régularité des performances',
      change: '+3%',
      trend: 'up' as const,
      progress: metricsData.consistency_score,
      type: 'consistency' as const
    }
  ];
};

export const generateEliteGoals = (stats: AffiliateStats): EliteGoal[] => {
  return [
    {
      id: 'network_expansion',
      title: 'Extension du Réseau Elite',
      description: 'Construire un réseau de 50 membres actifs',
      current_value: stats.level_1_referrals + stats.level_2_referrals,
      target_value: 50,
      unit: 'membres',
      category: 'growth',
      priority: 'high',
      deadline: '2024-03-31',
      reward: 'Badge Master Network + 500 points'
    },
    {
      id: 'influence_score',
      title: 'Score d\'Influence Maximum',
      description: 'Atteindre un score d\'influence de 95/100',
      current_value: Math.min(100, 70 + (stats.level_1_referrals * 2)),
      target_value: 95,
      unit: 'points',
      category: 'influence',
      priority: 'medium',
      deadline: '2024-04-15',
      reward: 'Statut Influenceur + Outils Premium'
    },
    {
      id: 'community_leader',
      title: 'Leader Communautaire',
      description: 'Contribuer 10 insights vérifiés à la communauté',
      current_value: 3,
      target_value: 10,
      unit: 'insights',
      category: 'community',
      priority: 'high',
      deadline: '2024-02-29',
      reward: 'Badge Community Leader + Mentorat'
    },
    {
      id: 'innovation_pioneer',
      title: 'Pionnier de l\'Innovation',
      description: 'Développer 3 nouvelles stratégies d\'affiliation',
      current_value: 1,
      target_value: 3,
      unit: 'stratégies',
      category: 'innovation',
      priority: 'medium',
      deadline: '2024-05-01',
      reward: 'Certification Innovation + Bonus 1000pts'
    }
  ];
};

export const generateMasterTools = (): MasterTool[] => {
  return [
    {
      id: 'advanced_analytics',
      name: 'Analytics Avancés',
      description: 'Tableaux de bord et métriques détaillées en temps réel',
      category: 'analytics',
      usage_level: 85,
      efficiency_gain: '+40% insights',
      premium_feature: true,
      icon: '📊'
    },
    {
      id: 'auto_campaigns',
      name: 'Campagnes Automatisées',
      description: 'Système d\'automatisation complète des campagnes',
      category: 'automation',
      usage_level: 92,
      efficiency_gain: '+60% productivité',
      premium_feature: true,
      icon: '🤖'
    },
    {
      id: 'ai_optimizer',
      name: 'Optimiseur IA',
      description: 'Intelligence artificielle pour optimiser les performances',
      category: 'optimization',
      usage_level: 78,
      efficiency_gain: '+35% conversion',
      premium_feature: true,
      icon: '🧠'
    },
    {
      id: 'community_hub',
      name: 'Hub Communautaire',
      description: 'Outils de gestion et d\'engagement communautaire',
      category: 'community',
      usage_level: 88,
      efficiency_gain: '+50% engagement',
      premium_feature: false,
      icon: '👥'
    },
    {
      id: 'predictive_model',
      name: 'Modèles Prédictifs',
      description: 'Prédiction des tendances et opportunités',
      category: 'analytics',
      usage_level: 65,
      efficiency_gain: '+25% anticipation',
      premium_feature: true,
      icon: '🔮'
    }
  ];
};

export const generatePerformanceInsights = (): PerformanceInsight[] => {
  return [
    {
      id: 'peak_performance',
      title: 'Pic de Performance Détecté',
      insight: 'Vos conversions sont 180% plus élevées le mardi entre 19h-21h. Concentrez vos efforts sur ce créneau.',
      action_required: true,
      impact_level: 'high',
      category: 'Timing',
      data_source: 'Analytics IA'
    },
    {
      id: 'network_opportunity',
      title: 'Opportunité Réseau',
      insight: 'Votre réseau niveau 2 montre un potentiel de croissance de 40%. Engagez plus avec vos filleuls.',
      action_required: true,
      impact_level: 'medium',
      category: 'Réseau',
      data_source: 'Analyse Collective'
    },
    {
      id: 'content_trend',
      title: 'Tendance Contenu',
      insight: 'Les contenus vidéo courts génèrent 3x plus d\'engagement dans votre niche. Adaptez votre stratégie.',
      action_required: false,
      impact_level: 'medium',
      category: 'Contenu',
      data_source: 'Veille Tendances'
    },
    {
      id: 'competitive_advantage',
      title: 'Avantage Concurrentiel',
      insight: 'Votre approche personnalisée vous démarque de 85% des autres affiliés. Maintenez cette différenciation.',
      action_required: false,
      impact_level: 'low',
      category: 'Stratégie',
      data_source: 'Benchmark'
    }
  ];
};
