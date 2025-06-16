
import { AffiliateStats } from "@/services/affiliateService";

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
