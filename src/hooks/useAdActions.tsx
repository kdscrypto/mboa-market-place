
import { AdListState } from "./types/adActionsTypes";
import { useAdSingleActions } from "./useAdSingleActions";
import { useAdBulkActions } from "./useAdBulkActions";

/**
 * Hook pour les actions de modération (approuver/rejeter/supprimer)
 * Combine les actions individuelles et en lot
 */
export const useAdActions = (
  isAuthenticated: boolean, 
  isAdmin: boolean,
  adState: AdListState
) => {
  const {
    handleApproveAd,
    handleRejectAd,
    handleDeleteAd
  } = useAdSingleActions(isAuthenticated, isAdmin, adState);

  const {
    handleBulkApprove,
    handleBulkDelete
  } = useAdBulkActions(isAuthenticated, isAdmin, adState);

  return {
    handleApproveAd,
    handleRejectAd,
    handleDeleteAd,
    handleBulkApprove,
    handleBulkDelete
  };
};
