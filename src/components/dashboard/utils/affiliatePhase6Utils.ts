
import { AffiliateStats } from "@/services/affiliateService";

export const generateEliteData = (affiliateStats: AffiliateStats | null) => {
  if (!affiliateStats) return null;
  
  // Calculate elite level based on total points (every 100 points = 1 level)
  const eliteLevel = Math.max(1, Math.floor(affiliateStats.total_points / 100) + 1);
  
  // Calculate mastery score based on actual performance metrics
  const totalReferrals = affiliateStats.level_1_referrals + affiliateStats.level_2_referrals;
  const referralScore = Math.min(40, totalReferrals * 2); // Max 40 points for referrals
  const pointsScore = Math.min(40, affiliateStats.total_points / 5); // Max 40 points for points
  const conversionScore = totalReferrals > 0 ? 
    Math.min(20, (affiliateStats.level_1_referrals / totalReferrals) * 20) : 0; // Max 20 for conversion
  
  const masteryScore = Math.floor(referralScore + pointsScore + conversionScore);
  
  // Calculate network contribution based on actual network size
  const networkContribution = Math.min(100, totalReferrals * 3);
  
  return {
    elite_level: eliteLevel,
    mastery_score: masteryScore,
    collective_contribution: networkContribution,
    elite_badges: [
      { name: 'Premier Pas', earned: affiliateStats.level_1_referrals >= 1 },
      { name: 'Constructeur de Réseau', earned: affiliateStats.level_1_referrals >= 5 },
      { name: 'Collectionneur de Points', earned: affiliateStats.total_points >= 50 },
      { name: 'Expert Affiliation', earned: affiliateStats.total_points >= 200 },
      { name: 'Maître du Réseau', earned: totalReferrals >= 20 }
    ],
    exclusive_perks: {
      vip_support: affiliateStats.total_points >= 100,
      early_access: affiliateStats.total_points >= 200,
      custom_branding: affiliateStats.total_points >= 300,
      personal_manager: affiliateStats.total_points >= 500
    },
    next_tier: {
      name: eliteLevel < 5 ? `Elite Niveau ${eliteLevel + 1}` : 'Master Elite',
      required_points: (eliteLevel * 100),
      progress: (affiliateStats.total_points % 100) / 100
    }
  };
};
