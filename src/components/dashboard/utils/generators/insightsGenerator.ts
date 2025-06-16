
import { AffiliateStats } from "@/services/affiliateService";
import { PerformanceInsight } from "../types/masterTypes";

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
