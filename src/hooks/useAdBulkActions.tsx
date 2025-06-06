import { useToast } from "@/hooks/use-toast";
import { updateAdStatus, deleteAd } from "@/services/adService";
import { AdListState } from "./types/adActionsTypes";

/**
 * Hook pour les actions en lot de modération (approuver/supprimer plusieurs annonces)
 */
export const useAdBulkActions = (
  isAuthenticated: boolean, 
  isAdmin: boolean,
  adState: AdListState
) => {
  const { toast } = useToast();
  const {
    pendingAds,
    setPendingAds,
    setApprovedAds,
    setRejectedAds
  } = adState;

  // Fonction pour approuver plusieurs annonces
  const handleBulkApprove = async (adIds: string[]) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const adId of adIds) {
      try {
        console.log("useAdBulkActions: Bulk approving ad:", adId);
        const success = await updateAdStatus(adId, 'approved');
        
        if (success) {
          successCount++;
          // Mettre à jour les listes localement
          setPendingAds(prev => prev.filter(ad => ad.id !== adId));
          const approvedAd = pendingAds.find(ad => ad.id === adId);
          if (approvedAd) {
            setApprovedAds(prev => [{ ...approvedAd, status: 'approved' }, ...prev]);
          }
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error("Error in bulk approve for ad:", adId, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Approbation en lot",
        description: `${successCount} annonce(s) approuvée(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
        duration: 3000
      });
    } else {
      toast({
        title: "Erreur",
        description: "Aucune annonce n'a pu être approuvée",
        variant: "destructive"
      });
    }
  };

  // Fonction pour supprimer plusieurs annonces
  const handleBulkDelete = async (adIds: string[]) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const adId of adIds) {
      try {
        console.log("useAdBulkActions: Bulk deleting ad:", adId);
        const success = await deleteAd(adId);
        
        if (success) {
          successCount++;
          // Mettre à jour les listes localement
          setPendingAds(prev => prev.filter(ad => ad.id !== adId));
          setApprovedAds(prev => prev.filter(ad => ad.id !== adId));
          setRejectedAds(prev => prev.filter(ad => ad.id !== adId));
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error("Error in bulk delete for ad:", adId, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Suppression en lot",
        description: `${successCount} annonce(s) supprimée(s) définitivement${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
        duration: 3000
      });
    } else {
      toast({
        title: "Erreur",
        description: "Aucune annonce n'a pu être supprimée",
        variant: "destructive"
      });
    }
  };

  return {
    handleBulkApprove,
    handleBulkDelete
  };
};
