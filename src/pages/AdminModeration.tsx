
import React, { useEffect } from "react";
import ModerationLayout from "@/components/moderation/ModerationLayout";
import ModerationTabs from "@/components/moderation/ModerationTabs";
import { useModerationAds } from "@/hooks/useModerationAds";

const AdminModeration = () => {
  console.log("AdminModeration page rendered");
  
  const {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    handleApproveAd,
    handleRejectAd
  } = useModerationAds();
  
  useEffect(() => {
    console.log("AdminModeration effect - data loaded:", {
      pendingAdsCount: pendingAds?.length || 0,
      approvedAdsCount: approvedAds?.length || 0,
      rejectedAdsCount: rejectedAds?.length || 0
    });
  }, [pendingAds, approvedAds, rejectedAds]);
  
  return (
    <ModerationLayout>
      <ModerationTabs
        pendingAds={pendingAds || []}
        approvedAds={approvedAds || []}
        rejectedAds={rejectedAds || []}
        isLoading={isLoading}
        onApprove={handleApproveAd}
        onReject={handleRejectAd}
      />
    </ModerationLayout>
  );
};

export default AdminModeration;
