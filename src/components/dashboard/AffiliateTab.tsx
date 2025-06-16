
import React, { useEffect, useState } from "react";
import { getAffiliateStats, AffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import AffiliateShareLinks from "./AffiliateShareLinks";
import AffiliateRealTimeStats from "./AffiliateRealTimeStats";
import AffiliateNotifications from "./AffiliateNotifications";
import AffiliateStatsCards from "./AffiliateStatsCards";
import AffiliateCodeSection from "./AffiliateCodeSection";
import AffiliateHowItWorksSection from "./AffiliateHowItWorksSection";

interface AffiliateTabProps {
  userId: string;
}

const AffiliateTab: React.FC<AffiliateTabProps> = ({ userId }) => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
      } catch (error) {
        console.error("Error fetching affiliate stats:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques d'affiliation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, toast]);

  const handleStatsUpdate = (newStats: AffiliateStats) => {
    setStats(newStats);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Impossible de charger les données d'affiliation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification des nouvelles fonctionnalités */}
      <AffiliateNotifications />

      {/* Statistics Cards */}
      <AffiliateStatsCards stats={stats} />

      {/* Real-time stats and share links */}
      <div className="grid gap-6 md:grid-cols-2">
        <AffiliateRealTimeStats 
          userId={userId} 
          initialStats={stats}
          onStatsUpdate={handleStatsUpdate}
        />
        
        <AffiliateShareLinks affiliateCode={stats.affiliate_code} />
      </div>

      {/* Affiliate Code Section */}
      <AffiliateCodeSection affiliateCode={stats.affiliate_code} />

      {/* How to earn more section */}
      <AffiliateHowItWorksSection />
    </div>
  );
};

export default AffiliateTab;
