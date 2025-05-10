
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
          
          // Refresh all lists regardless of the specific change
          // This ensures we capture any status transitions completely
          try {
            console.log("Refreshing all ad lists due to database change");
            
            const pending = await fetchAdsWithStatus('pending');
            console.log("Refreshed pending ads count:", pending.length);
            setPendingAds(pending);
            
            const approved = await fetchAdsWithStatus('approved');
            console.log("Refreshed approved ads count:", approved.length);
            setApprovedAds(approved);
            
            const rejected = await fetchAdsWithStatus('rejected');
            console.log("Refreshed rejected ads count:", rejected.length);
            setRejectedAds(rejected);
          } catch (error) {
            console.error("Error refreshing ad lists:", error);
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
