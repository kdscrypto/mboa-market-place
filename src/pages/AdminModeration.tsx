
import React from "react";
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
  
  console.log("AdminModeration data:", {
    isLoading,
    pendingAds: pendingAds?.length || 0,
    approvedAds: approvedAds?.length || 0,
    rejectedAds: rejectedAds?.length || 0
  });
  
  return (
    <ModerationLayout>
      <ModerationTabs
        pendingAds={pendingAds}
        approvedAds={approvedAds}
        rejectedAds={rejectedAds}
        isLoading={isLoading}
        onApprove={handleApproveAd}
        onReject={handleRejectAd}
      />
    </ModerationLayout>
  );
};

export default AdminModeration;
