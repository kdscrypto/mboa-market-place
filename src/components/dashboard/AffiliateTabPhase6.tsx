
import React from "react";
import AffiliatePhase6Header from "./components/AffiliatePhase6Header";
import AffiliatePhase6Banner from "./components/AffiliatePhase6Banner";
import AffiliatePhase6Tabs from "./components/AffiliatePhase6Tabs";
import AffiliatePhase6LoadingState from "./components/AffiliatePhase6LoadingState";
import AffiliatePhase6ErrorState from "./components/AffiliatePhase6ErrorState";
import { useAffiliatePhase6Data } from "./hooks/useAffiliatePhase6Data";

interface AffiliateTabPhase6Props {
  userId: string;
}

const AffiliateTabPhase6: React.FC<AffiliateTabPhase6Props> = ({ userId }) => {
  const { stats, eliteData, loading } = useAffiliatePhase6Data({ userId });

  if (loading) {
    return <AffiliatePhase6LoadingState />;
  }

  if (!stats) {
    return <AffiliatePhase6ErrorState />;
  }

  return (
    <div className="space-y-6">
      <AffiliatePhase6Header />
      <AffiliatePhase6Banner eliteData={eliteData} />
      <AffiliatePhase6Tabs stats={stats} eliteData={eliteData} userId={userId} />
    </div>
  );
};

export default AffiliateTabPhase6;
