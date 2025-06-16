
import { useState, useEffect } from "react";
import { AffiliateStats, getAffiliateStats } from "@/services/affiliateService";
import { useToast } from "@/hooks/use-toast";
import { generateEliteData } from "../utils/affiliatePhase6Utils";

interface UseAffiliatePhase6DataProps {
  userId: string;
}

interface UseAffiliatePhase6DataReturn {
  stats: AffiliateStats | null;
  eliteData: any;
  loading: boolean;
}

export const useAffiliatePhase6Data = ({ 
  userId 
}: UseAffiliatePhase6DataProps): UseAffiliatePhase6DataReturn => {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [eliteData, setEliteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const affiliateStats = await getAffiliateStats(userId);
        setStats(affiliateStats);
        
        const eliteInfo = generateEliteData(affiliateStats);
        setEliteData(eliteInfo);
      } catch (error) {
        console.error("Error fetching affiliate stats:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques d'affiliation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, toast]);

  return {
    stats,
    eliteData,
    loading
  };
};
