
import React from "react";
import ModerationLayout from "@/components/moderation/ModerationLayout";
import ModerationTabs from "@/components/moderation/ModerationTabs";
import { useModerationAds } from "@/hooks/useModerationAds";

const AdminModeration = () => {
  const {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    handleApproveAd,
    handleRejectAd
  } = useModerationAds();
  
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
