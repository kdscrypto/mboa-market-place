
import React from "react";
import { GroupedPremiumAds } from "@/services/premiumService";
import PremiumAdGrid from "./PremiumAdGrid";

interface GroupedPremiumAdsListProps {
  groupedAds: GroupedPremiumAds[];
}

const GroupedPremiumAdsList: React.FC<GroupedPremiumAdsListProps> = ({ groupedAds }) => {
  return (
    <>
      {groupedAds.map((group, index) => (
        <PremiumAdGrid 
          key={index} 
          ads={group.ads} 
          title={`${group.category} à ${group.city}`} 
        />
      ))}
    </>
  );
};

export default GroupedPremiumAdsList;
