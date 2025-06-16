
import React from "react";
import AffiliatePhase6LoadingState from "./AffiliatePhase6LoadingState";
import AffiliatePhase6ErrorState from "./AffiliatePhase6ErrorState";
import AffiliatePhase6Content from "./AffiliatePhase6Content";
import { useAffiliatePhase6Data } from "../hooks/useAffiliatePhase6Data";

interface AffiliatePhase6StateManagerProps {
  userId: string;
}

const AffiliatePhase6StateManager: React.FC<AffiliatePhase6StateManagerProps> = ({ userId }) => {
  const { stats, eliteData, loading } = useAffiliatePhase6Data({ userId });

  if (loading) {
    return <AffiliatePhase6LoadingState />;
  }

  if (!stats) {
    return <AffiliatePhase6ErrorState />;
  }

  return <AffiliatePhase6Content stats={stats} eliteData={eliteData} userId={userId} />;
};

export default AffiliatePhase6StateManager;
