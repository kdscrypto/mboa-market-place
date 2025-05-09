
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdFormData } from "./AdFormTypes";

export const useAdSubmission = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (formData: AdFormData, setShowPreview: (show: boolean) => void) => {
    setIsLoading(true);
    
    try {
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour publier une annonce.",
          variant: "destructive"
        });
        navigate("/connexion");
        return;
      }
      
      // In a real app, this would connect to Supabase to save the ad
      console.log("Form data:", formData);
      
      // Simulate submission
      setTimeout(() => {
        toast({
          title: "Annonce soumise",
          description: "Votre annonce a été soumise pour approbation.",
          duration: 3000
        });
        setIsLoading(false);
        setShowPreview(false);
        navigate("/mes-annonces");
      }, 1500);
    } catch (error) {
      console.error("Error submitting the ad:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la publication de votre annonce.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    setIsLoading,
    handleSubmit
  };
};
