
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/adTypes";
import { fetchAdsWithStatus } from "@/services/adService";

/**
 * Hook pour charger les listes d'annonces
 */
export const useAdsList = (isAuthenticated: boolean, isAdmin: boolean) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [approvedAds, setApprovedAds] = useState<Ad[]>([]);
  const [rejectedAds, setRejectedAds] = useState<Ad[]>([]);

  // Récupérer les annonces au chargement initial
  useEffect(() => {
    const loadAllAds = async () => {
      if (!isAuthenticated || !isAdmin) {
        setIsLoading(false);
        return;
      }
      
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
  }, [toast, isAuthenticated, isAdmin]);

  return {
    isLoading,
    pendingAds,
    approvedAds,
    rejectedAds,
    setPendingAds,
    setApprovedAds,
    setRejectedAds
  };
};
