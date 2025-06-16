
import React from "react";
import AffiliatePhase6StateManager from "./components/AffiliatePhase6StateManager";

interface AffiliateTabPhase6Props {
  userId: string;
}

const AffiliateTabPhase6: React.FC<AffiliateTabPhase6Props> = ({ userId }) => {
  return <AffiliatePhase6StateManager userId={userId} />;
};

export default AffiliateTabPhase6;
