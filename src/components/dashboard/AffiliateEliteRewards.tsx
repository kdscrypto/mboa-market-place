
import React, { useState, useEffect } from "react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import PointsBalanceCard from "./components/PointsBalanceCard";
import ElitePerksSection from "./components/ElitePerksSection";
import RewardsCatalogSection from "./components/RewardsCatalogSection";
import VIPExperiencesSection from "./components/VIPExperiencesSection";
import { Reward, ElitePerks, VIPExperience } from "./types/rewardsTypes";
import { generateRewards, generateElitePerks, generateVIPExperiences } from "./utils/rewardsDataGenerator";

interface AffiliateEliteRewardsProps {
  stats: AffiliateStats;
  eliteData: any;
}

const AffiliateEliteRewards: React.FC<AffiliateEliteRewardsProps> = ({ 
  stats, 
  eliteData 
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [elitePerks, setElitePerks] = useState<ElitePerks[]>([]);
  const [vipExperiences, setVipExperiences] = useState<VIPExperience[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeRewards();
    setAvailablePoints(stats.total_points);
  }, [stats, eliteData]);

  const initializeRewards = () => {
    const rewardsCatalog = generateRewards();
    const perks = generateElitePerks(stats);
    const experiences = generateVIPExperiences();

    setRewards(rewardsCatalog);
    setElitePerks(perks);
    setVipExperiences(experiences);
  };

  const claimReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    const experience = vipExperiences.find(e => e.id === rewardId);
    const item = reward || experience;
    
    if (item && availablePoints >= item.cost) {
      setAvailablePoints(prev => prev - item.cost);
      toast({
        title: "🎉 Récompense réclamée !",
        description: `Vous avez échangé "${item.title}" contre ${item.cost} points !`,
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      <PointsBalanceCard availablePoints={availablePoints} />

      <ElitePerksSection elitePerks={elitePerks} stats={stats} />

      <RewardsCatalogSection 
        rewards={rewards}
        availablePoints={availablePoints}
        eliteLevel={eliteData?.elite_level || 1}
        onClaimReward={claimReward}
      />

      <VIPExperiencesSection 
        vipExperiences={vipExperiences}
        availablePoints={availablePoints}
        onClaimReward={claimReward}
      />
    </div>
  );
};

export default AffiliateEliteRewards;
