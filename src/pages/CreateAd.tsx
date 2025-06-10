
import React from "react";
import CreateAdPage from "@/components/ads/create/CreateAdPage";
import AuthGuard from "@/components/auth/AuthGuard";

const CreateAd = () => {
  return (
    <AuthGuard>
      <CreateAdPage />
    </AuthGuard>
  );
};

export default CreateAd;
