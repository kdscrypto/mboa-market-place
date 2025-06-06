import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdsList } from "@/hooks/useAdsList";
import { useAdActions } from "@/hooks/useAdActions";
import { useAdRealtime } from "@/hooks/useAdRealtime";

// Change this re-export to use 'export type' syntax
export type { Ad } from "@/types/adTypes";

/**
 * Hook principal pour la modération des annonces
 * Combine les fonctionnalités d'authentification, de chargement des annonces
 * et de gestion des actions de modération
 */
export const useModerationAds = () => {
  // Gestion de l'authentification et des droits d'accès
  const {
    isAuthLoading,
    isAuthenticated,
    isAdmin,
    setAuthLoading
  } = useAdminAuth();
  
  // Gestion des listes d'annonces
  const adsList = useAdsList(isAuthenticated, isAdmin);
  const {
    isLoading: isAdsLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    setPendingAds,
    setApprovedAds,
    setRejectedAds
  } = adsList;
  
  // Gestion des actions de modération
  const { handleApproveAd, handleRejectAd, handleDeleteAd } = useAdActions(
    isAuthenticated,
    isAdmin,
    {
      pendingAds,
      approvedAds,
      rejectedAds,
      setPendingAds,
      setApprovedAds,
      setRejectedAds
    }
  );
  
  // Configure real-time updates
  useAdRealtime({ setPendingAds, setApprovedAds, setRejectedAds });

  // Déterminer l'état de chargement global
  const isLoading = isAuthLoading || isAdsLoading;

  return {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    handleApproveAd,
    handleRejectAd,
    handleDeleteAd,
    isAuthenticated,
    isAdmin
  };
};
