
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/adTypes";
import { fetchAdsWithStatus, updateAdStatus } from "@/services/adService";
import { useAdRealtime } from "@/hooks/useAdRealtime";

// Change this re-export to use 'export type' syntax
export type { Ad } from "@/types/adTypes";

export const useModerationAds = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [approvedAds, setApprovedAds] = useState<Ad[]>([]);
  const [rejectedAds, setRejectedAds] = useState<Ad[]>([]);

  // Configure real-time updates
  useAdRealtime({ setPendingAds, setApprovedAds, setRejectedAds });

  // Récupérer les annonces au chargement initial
  useEffect(() => {
    const loadAllAds = async () => {
      setIsLoading(true);
      
      try {
        // Récupérer les annonces en attente
        const pending = await fetchAdsWithStatus('pending');
        console.log("Pending ads loaded:", pending.length);
        setPendingAds(pending);
        
        // Récupérer les annonces approuvées
        const approved = await fetchAdsWithStatus('approved');
        console.log("Approved ads loaded:", approved.length);
        setApprovedAds(approved);
        
        // Récupérer les annonces rejetées
        const rejected = await fetchAdsWithStatus('rejected');
        console.log("Rejected ads loaded:", rejected.length);
        setRejectedAds(rejected);
      } catch (error) {
        console.error("Error loading ads:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les annonces",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllAds();
  }, [toast]);

  // Fonctions pour mettre à jour le statut d'une annonce
  const handleApproveAd = async (adId: string) => {
    try {
      console.log("Approving ad:", adId);
      
      const success = await updateAdStatus(adId, 'approved');
      
      if (!success) throw new Error("Failed to approve ad");
      
      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été publiée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
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

  const handleRejectAd = async (adId: string) => {
    try {
      console.log("Rejecting ad:", adId);
      
      const success = await updateAdStatus(adId, 'rejected');
      
      if (!success) throw new Error("Failed to reject ad");
      
      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      const rejectedAd = pendingAds.find(ad => ad.id === adId);
      if (rejectedAd) {
        setRejectedAds(prev => [{ ...rejectedAd, status: 'rejected' }, ...prev]);
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

  return {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    handleApproveAd,
    handleRejectAd
  };
};
