
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  region: string;
  phone: string;
  whatsapp?: string;
  status: string;
  created_at: string;
  imageUrl: string;
}

export const useModerationAds = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [approvedAds, setApprovedAds] = useState<Ad[]>([]);
  const [rejectedAds, setRejectedAds] = useState<Ad[]>([]);

  // Fonction pour récupérer toutes les annonces avec leurs images principales
  const fetchAdsWithStatus = async (status: string) => {
    try {
      console.log(`Fetching ads with status: ${status}`);
      
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Erreur lors de la récupération des annonces ${status}:`, error);
        throw error;
      }
      
      console.log(`${status} ads retrieved:`, ads);
      
      // Pour chaque annonce, récupérer l'image principale
      const adsWithImages = await Promise.all(
        (ads || []).map(async (ad) => {
          const { data: images, error: imageError } = await supabase
            .from('ad_images')
            .select('image_url')
            .eq('ad_id', ad.id)
            .order('position', { ascending: true })
            .limit(1);
          
          if (imageError) {
            console.error(`Error retrieving images for ad ${ad.id}:`, imageError);
          }
          
          return {
            ...ad,
            imageUrl: images && images.length > 0 ? images[0].image_url : '/placeholder.svg'
          };
        })
      );
      
      return adsWithImages;
    } catch (error) {
      console.error(`Error retrieving ads with status ${status}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive"
      });
      return [];
    }
  };

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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllAds();
  }, [toast]);

  // S'abonner aux mises à jour en temps réel
  useEffect(() => {
    console.log("Setting up realtime subscription for ads");
    
    const channel = supabase
      .channel('ads-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'ads'
        }, 
        async (payload) => {
          console.log('Change detected in ads:', payload);
          
          // Mettre à jour la liste appropriée en fonction du statut
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            const status = payload.new.status as string;
            
            // Rafraîchir la liste appropriée
            if (status === 'pending') {
              const pending = await fetchAdsWithStatus('pending');
              setPendingAds(pending);
            } else if (status === 'approved') {
              const approved = await fetchAdsWithStatus('approved');
              setApprovedAds(approved);
            } else if (status === 'rejected') {
              const rejected = await fetchAdsWithStatus('rejected');
              setRejectedAds(rejected);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Fonctions pour mettre à jour le statut d'une annonce
  const handleApproveAd = async (adId: string) => {
    try {
      console.log("Approving ad:", adId);
      
      const { error } = await supabase
        .from('ads')
        .update({ status: 'approved' })
        .eq('id', adId);
      
      if (error) throw error;
      
      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été publiée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
      const approvedAd = pendingAds.find(ad => ad.id === adId);
      if (approvedAd) {
        setApprovedAds([{ ...approvedAd, status: 'approved' }, ...approvedAds]);
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
      
      const { error } = await supabase
        .from('ads')
        .update({ status: 'rejected' })
        .eq('id', adId);
      
      if (error) throw error;
      
      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée avec succès",
        duration: 3000
      });
      
      // Mettre à jour les listes localement
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
      const rejectedAd = pendingAds.find(ad => ad.id === adId);
      if (rejectedAd) {
        setRejectedAds([{ ...rejectedAd, status: 'rejected' }, ...rejectedAds]);
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
