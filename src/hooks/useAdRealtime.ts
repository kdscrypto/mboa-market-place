
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdsWithStatus } from "@/services/adService";
import { Ad } from "@/types/adTypes";

interface UseAdRealtimeProps {
  setPendingAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setApprovedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
  setRejectedAds: React.Dispatch<React.SetStateAction<Ad[]>>;
}

export const useAdRealtime = ({ setPendingAds, setApprovedAds, setRejectedAds }: UseAdRealtimeProps) => {
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
      .subscribe(status => {
        console.log("Realtime subscription status:", status);
      });
      
    return () => {
      console.log("Removing realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [setPendingAds, setApprovedAds, setRejectedAds]);
};
