import { useState, useEffect } from "react";
import { adRatingService, AdRatingStats, UserRating } from "@/services/adRatingService";
import { useToast } from "@/hooks/use-toast";

export const useAdRating = (adId: string, userId?: string) => {
  const [stats, setStats] = useState<AdRatingStats | null>(null);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRatingData = async () => {
    try {
      setIsLoading(true);
      
      const [statsData, userRatingData] = await Promise.all([
        adRatingService.getRatingStats(adId),
        userId ? adRatingService.getUserRating(adId, userId) : Promise.resolve(null)
      ]);

      setStats(statsData);
      setUserRating(userRatingData);
    } catch (error) {
      console.error('Error fetching rating data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les évaluations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitRating = async (rating: number, comment?: string) => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour évaluer cette annonce",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await adRatingService.submitRating(adId, rating, comment);
      
      toast({
        title: "Évaluation soumise",
        description: "Votre évaluation a été enregistrée avec succès",
      });

      // Refresh data
      await fetchRatingData();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre évaluation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (adId) {
      fetchRatingData();
    }
  }, [adId, userId]);

  return {
    stats,
    userRating,
    isLoading,
    isSubmitting,
    submitRating,
    refresh: fetchRatingData
  };
};