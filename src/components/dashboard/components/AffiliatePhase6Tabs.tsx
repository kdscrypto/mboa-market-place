
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Gift, Users, Crown, Diamond } from "lucide-react";
import { AffiliateStats } from "@/services/affiliateService";
import AffiliateGamificationHub from "../AffiliateGamificationHub";
import AffiliateEliteRewards from "../AffiliateEliteRewards";
import AffiliateCollectiveIntelligence from "../AffiliateCollectiveIntelligence";
import AffiliateMasterDashboard from "../AffiliateMasterDashboard";
import AffiliateExclusiveFeatures from "../AffiliateExclusiveFeatures";

interface AffiliatePhase6TabsProps {
  stats: AffiliateStats;
  eliteData: any;
  userId: string;
}

const AffiliatePhase6Tabs: React.FC<AffiliatePhase6TabsProps> = ({ 
  stats, 
  eliteData, 
  userId 
}) => {
  return (
    <Tabs defaultValue="gamification" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-theme-surface-elevated border border-theme-border">
        <TabsTrigger 
          value="gamification" 
          className="flex items-center gap-1 text-xs data-[state=active]:bg-mboa-orange data-[state=active]:text-white text-theme-text-secondary hover:text-theme-text"
        >
          <Gamepad2 className="h-3 w-3" />
          <span className="hidden sm:inline">Gamification</span>
          <span className="sm:hidden">Game</span>
        </TabsTrigger>
        <TabsTrigger 
          value="rewards" 
          className="flex items-center gap-1 text-xs data-[state=active]:bg-mboa-orange data-[state=active]:text-white text-theme-text-secondary hover:text-theme-text"
        >
          <Gift className="h-3 w-3" />
          <span className="hidden sm:inline">Récompenses</span>
          <span className="sm:hidden">Gifts</span>
        </TabsTrigger>
        <TabsTrigger 
          value="collective" 
          className="flex items-center gap-1 text-xs data-[state=active]:bg-mboa-orange data-[state=active]:text-white text-theme-text-secondary hover:text-theme-text"
        >
          <Users className="h-3 w-3" />
          <span className="hidden sm:inline">Intelligence</span>
          <span className="sm:hidden">Intel</span>
        </TabsTrigger>
        <TabsTrigger 
          value="master" 
          className="flex items-center gap-1 text-xs data-[state=active]:bg-mboa-orange data-[state=active]:text-white text-theme-text-secondary hover:text-theme-text"
        >
          <Crown className="h-3 w-3" />
          <span className="hidden sm:inline">Master Hub</span>
          <span className="sm:hidden">Hub</span>
        </TabsTrigger>
        <TabsTrigger 
          value="exclusive" 
          className="flex items-center gap-1 text-xs data-[state=active]:bg-mboa-orange data-[state=active]:text-white text-theme-text-secondary hover:text-theme-text"
        >
          <Diamond className="h-3 w-3" />
          <span className="hidden sm:inline">Exclusif</span>
          <span className="sm:hidden">VIP</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="gamification" className="mt-4">
        <AffiliateGamificationHub stats={stats} eliteData={eliteData} />
      </TabsContent>

      <TabsContent value="rewards" className="mt-4">
        <AffiliateEliteRewards stats={stats} eliteData={eliteData} />
      </TabsContent>

      <TabsContent value="collective" className="mt-4">
        <AffiliateCollectiveIntelligence stats={stats} userId={userId} />
      </TabsContent>

      <TabsContent value="master" className="mt-4">
        <AffiliateMasterDashboard stats={stats} eliteData={eliteData} userId={userId} />
      </TabsContent>

      <TabsContent value="exclusive" className="mt-4">
        <AffiliateExclusiveFeatures stats={stats} eliteData={eliteData} userId={userId} />
      </TabsContent>
    </Tabs>
  );
};

export default AffiliatePhase6Tabs;
