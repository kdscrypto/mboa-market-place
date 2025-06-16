
import React, { useState, useEffect } from "react";
import { AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import GamificationStatusCards from "./components/GamificationStatusCards";
import ChallengesSection from "./components/ChallengesSection";
import AchievementsSection from "./components/AchievementsSection";
import LeaderboardSection from "./components/LeaderboardSection";
import { Challenge, Achievement, LeaderboardEntry } from "./types/gamificationTypes";
import { generateChallenges, generateAchievements, generateLeaderboard } from "./utils/gamificationDataGenerator";

interface AffiliateGamificationHubProps {
  stats: AffiliateStats;
  eliteData: any;
}

const AffiliateGamificationHub: React.FC<AffiliateGamificationHubProps> = ({ 
  stats, 
  eliteData 
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    initializeGamificationData();
  }, [stats]);

  const initializeGamificationData = () => {
    const activeChallenges = generateChallenges(stats);
    const gameAchievements = generateAchievements(stats, eliteData);
    const gameLeaderboard = generateLeaderboard(stats, eliteData);

    setChallenges(activeChallenges);
    setAchievements(gameAchievements);
    setLeaderboard(gameLeaderboard);
    setCurrentStreak(Math.floor(Math.random() * 10) + 1);
    setPlayerLevel(eliteData?.elite_level || 1);
  };

  const claimReward = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && challenge.status === 'completed') {
      toast({
        title: "🎉 Récompense réclamée !",
        description: `Vous avez gagné ${challenge.reward_points} points !`,
        duration: 4000
      });
    }
  };

  return (
    <div className="space-y-6">
      <GamificationStatusCards
        playerLevel={playerLevel}
        currentStreak={currentStreak}
        unlockedAchievements={achievements.filter(a => a.unlocked).length}
        totalAchievements={achievements.length}
        activeChallenges={challenges.filter(c => c.status === 'active').length}
      />

      <ChallengesSection challenges={challenges} onClaimReward={claimReward} />

      <AchievementsSection achievements={achievements} />

      <LeaderboardSection leaderboard={leaderboard} />
    </div>
  );
};

export default AffiliateGamificationHub;
