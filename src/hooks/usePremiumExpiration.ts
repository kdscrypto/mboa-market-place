
import { useState, useEffect, useCallback } from 'react';
import { convertExpiredPremiumAds, ExpirationResult } from '@/services/premiumExpirationService';
import { useToast } from '@/hooks/use-toast';

export const usePremiumExpiration = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  // Function to manually trigger expiration check
  const checkExpiredAds = useCallback(async (): Promise<ExpirationResult> => {
    setIsChecking(true);
    try {
      const result = await convertExpiredPremiumAds();
      setLastCheck(new Date());
      
      if (result.error) {
        toast({
          title: "Erreur lors de la vérification",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.convertedCount > 0) {
        toast({
          title: "Annonces expirées converties",
          description: `${result.convertedCount} annonce(s) premium expirée(s) ont été converties en annonces standard.`
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        title: "Erreur inattendue",
        description: errorMessage,
        variant: "destructive"
      });
      return { convertedCount: 0, error: errorMessage };
    } finally {
      setIsChecking(false);
    }
  }, [toast]);

  // Automatic check on mount and periodically
  useEffect(() => {
    // Check immediately on mount
    checkExpiredAds();

    // Set up periodic checks every 30 minutes
    const interval = setInterval(() => {
      checkExpiredAds();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [checkExpiredAds]);

  return {
    isChecking,
    lastCheck,
    checkExpiredAds
  };
};
