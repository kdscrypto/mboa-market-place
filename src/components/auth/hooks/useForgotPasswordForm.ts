
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ForgotPasswordFormValues } from "../validation/authSchemas";

export const useForgotPasswordForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      // Utiliser l'URL complète de l'application actuelle
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/reset-password`;
      
      console.log("Envoi de l'email de réinitialisation avec redirectTo:", redirectUrl);
        
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        console.error("Erreur Supabase:", error);
        toast({
          title: "Erreur",
          description: error.message,
          duration: 3000
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.",
        duration: 5000
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de l'email.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleForgotPassword, isLoading, isSuccess };
};
