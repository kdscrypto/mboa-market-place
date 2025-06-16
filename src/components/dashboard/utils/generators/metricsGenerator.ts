
import { AffiliateStats } from "@/services/affiliateService";
import { MasterMetric } from "../types/masterTypes";

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
