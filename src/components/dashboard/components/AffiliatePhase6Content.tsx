
import React from "react";
import AffiliatePhase6Header from "./AffiliatePhase6Header";
import AffiliatePhase6Banner from "./AffiliatePhase6Banner";
import AffiliatePhase6Tabs from "./AffiliatePhase6Tabs";
import { AffiliateStats } from "@/services/affiliateService";

interface AffiliatePhase6ContentProps {
  stats: AffiliateStats;
  eliteData: any;
  userId: string;
}

const AffiliatePhase6Content: React.FC<AffiliatePhase6ContentProps> = ({ 
  stats, 
  eliteData, 
  userId 
}) => {
  return (
    <div className="space-y-6">
      <AffiliatePhase6Header />
      <AffiliatePhase6Banner eliteData={eliteData} />
      <AffiliatePhase6Tabs stats={stats} eliteData={eliteData} userId={userId} />
    </div>
  );
};

export default AffiliatePhase6Content;
