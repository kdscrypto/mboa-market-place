
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
      // Use the Lovable preview URL instead of localhost for development
      const redirectUrl = window.location.origin.includes('localhost') 
        ? 'https://your-project.lovable.app/reset-password'  // Remplacez par votre vraie URL Lovable
        : `${window.location.origin}/reset-password`;
        
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
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
