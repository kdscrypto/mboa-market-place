import { useToast } from "@/hooks/use-toast";
import { updateAdStatus, deleteAd } from "@/services/adService";
import { Ad } from "@/types/adTypes";

type AdListState = {
  pendingAds: Ad[];
  approvedAds: Ad[];
  rejectedAds: Ad[];
  setPendingAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setApprovedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setRejectedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
};

/**
 * Hook pour les actions de modération (approuver/rejeter/supprimer)
 */
export const useAdActions = (
  isAuthenticated: boolean, 
  isAdmin: boolean,
  adState: AdListState
) => {
  const { toast } = useToast();
  const {
    pendingAds,
    approvedAds,
    rejectedAds,
    setPendingAds,
    setApprovedAds,
    setRejectedAds
  } = adState;

  // Fonction pour approuver une annonce
  const handleApproveAd = async (adId: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("useAdActions: Approving ad:", adId);
      
      const success = await updateAdStatus(adId, 'approved');
      
      if (!success) throw new Error("Failed to approve ad");
      
      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été publiée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement - use functional updates
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      const approvedAd = pendingAds.find(ad => ad.id === adId);
      if (approvedAd) {
        setApprovedAds(prev => [{ ...approvedAd, status: 'approved' }, ...prev]);
      }
    } catch (error) {
      console.error("Error approving ad:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'approbation de l'annonce",
        variant: "destructive"
      });
    }
  };

  // Fonction pour rejeter une annonce
  const handleRejectAd = async (adId: string, rejectMessage?: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("useAdActions: Rejecting ad:", adId, "with message:", rejectMessage);
      
      if (!rejectMessage || rejectMessage.trim() === '') {
        toast({
          title: "Message requis",
          description: "Veuillez fournir un message expliquant le rejet",
          variant: "destructive"
        });
        return;
      }
      
      const success = await updateAdStatus(adId, 'rejected', rejectMessage);
      
      if (!success) throw new Error("Failed to reject ad");
      
      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée et le vendeur a été notifié",
        duration: 3000
      });
      
      // Mettre à jour les listes localement - use functional updates
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      const rejectedAd = pendingAds.find(ad => ad.id === adId);
      if (rejectedAd) {
        setRejectedAds(prev => [{ ...rejectedAd, status: 'rejected', reject_reason: rejectMessage }, ...prev]);
      }
    } catch (error) {
      console.error("Error rejecting ad:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors du rejet de l'annonce",
        variant: "destructive"
      });
    }
  };

  // Fonction pour supprimer définitivement une annonce
  const handleDeleteAd = async (adId: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits pour effectuer cette action",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("useAdActions: Deleting ad:", adId);
      
      const success = await deleteAd(adId);
      
      if (!success) throw new Error("Failed to delete ad");
      
      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée définitivement",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setApprovedAds(prev => prev.filter(ad => ad.id !== adId));
      setRejectedAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la suppression de l'annonce",
        variant: "destructive"
      });
    }
  };

  return {
    handleApproveAd,
    handleRejectAd,
    handleDeleteAd
  };
};
