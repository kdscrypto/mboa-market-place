
import React from "react";
import { GroupedPremiumAds } from "@/services/premiumService";
import PremiumAdGrid from "./PremiumAdGrid";

interface GroupedPremiumAdsListProps {
  groupedAds: GroupedPremiumAds[];
}

const GroupedPremiumAdsList: React.FC<GroupedPremiumAdsListProps> = ({ groupedAds }) => {
  if (!groupedAds || groupedAds.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      {groupedAds.map((group, index) => (
        <PremiumAdGrid 
          key={index} 
          ads={group.ads} 
          title={`${group.category} à ${group.city}`} 
        />
      ))}
    </div>
  );
};

export default GroupedPremiumAdsList;
