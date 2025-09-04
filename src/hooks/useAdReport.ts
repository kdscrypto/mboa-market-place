import { useState, useEffect } from "react";
import { adReportService, AdReportSubmission } from "@/services/adReportService";
import { useToast } from "@/hooks/use-toast";

export const useAdReport = (adId: string, userId?: string) => {
  const [hasReported, setHasReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkUserReport = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const reported = await adReportService.checkUserReport(adId, userId);
      setHasReported(reported);
    } catch (error) {
      console.error('Error checking user report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReport = async (reportData: AdReportSubmission) => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour signaler cette annonce",
        variant: "destructive"
      });
      return false;
    }

    if (hasReported) {
      toast({
        title: "Déjà signalé",
        description: "Vous avez déjà signalé cette annonce",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsSubmitting(true);
      await adReportService.submitReport(adId, reportData);
      
      setHasReported(true);
      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été transmis à la modération",
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le signalement",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (adId) {
      checkUserReport();
    }
  }, [adId, userId]);

  return {
    hasReported,
    isSubmitting,
    isLoading,
    submitReport
  };
};