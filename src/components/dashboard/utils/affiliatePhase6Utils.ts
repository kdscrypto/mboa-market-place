
import { AffiliateStats } from "@/services/affiliateService";

export const generateEliteData = (affiliateStats: AffiliateStats | null) => {
  if (!affiliateStats) return null;
  
  return {
    elite_level: Math.min(10, Math.floor(affiliateStats.total_points / 100) + 1),
    mastery_score: Math.min(100, 60 + (affiliateStats.total_points / 20)),
    collective_contribution: Math.floor(Math.random() * 80) + 20,
    elite_badges: [
      { name: 'Master Recruiter', earned: affiliateStats.level_1_referrals >= 10 },
      { name: 'Network Builder', earned: affiliateStats.level_2_referrals >= 5 },
      { name: 'Point Collector', earned: affiliateStats.total_points >= 100 },
      { name: 'Elite Champion', earned: affiliateStats.total_points >= 500 }
    ],
    exclusive_perks: {
      vip_support: affiliateStats.total_points >= 100,
      early_access: affiliateStats.total_points >= 200,
      custom_branding: affiliateStats.total_points >= 300,
      personal_manager: affiliateStats.total_points >= 500
    },
    next_tier: {
      name: 'Diamond Elite',
      required_points: Math.ceil((affiliateStats.total_points + 100) / 100) * 100,
      progress: (affiliateStats.total_points % 100) / 100
    }
  };
};
