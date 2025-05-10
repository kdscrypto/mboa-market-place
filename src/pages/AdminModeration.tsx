
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModerationLayout from "@/components/moderation/ModerationLayout";
import ModerationTabs from "@/components/moderation/ModerationTabs";
import { useModerationAds } from "@/hooks/useModerationAds";
import { Loader2 } from "lucide-react";

const AdminModeration = () => {
  console.log("AdminModeration page rendered");
  const navigate = useNavigate();
  
  const {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    handleApproveAd,
    handleRejectAd,
    isAuthenticated,
    isAdmin
  } = useModerationAds();
  
  // Redirect if user is not authenticated or not an admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/connexion");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  useEffect(() => {
    console.log("AdminModeration effect - data loaded:", {
      pendingAdsCount: pendingAds?.length || 0,
      approvedAdsCount: approvedAds?.length || 0,
      rejectedAdsCount: rejectedAds?.length || 0
    });
  }, [pendingAds, approvedAds, rejectedAds]);
  
  // If still checking authentication or loading data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-mboa-green mx-auto mb-2" />
          <p>Chargement des annonces...</p>
        </div>
      </div>
    );
  }
  
  // If not an admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-red-50 rounded-lg border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="mb-6">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
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
