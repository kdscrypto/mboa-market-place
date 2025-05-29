
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResetPasswordFormValues } from "../validation/authSchemas";
import { getPasswordUpdateErrorMessage, shouldRedirectToForgotPassword } from "./utils/resetPasswordUtils";

export const useResetPasswordSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    console.log("[RESET_PASSWORD_SUBMIT] Attempting password reset");
    
    setIsLoading(true);
    try {
      console.log("[RESET_PASSWORD_SUBMIT] Updating password...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("[RESET_PASSWORD_SUBMIT] Password update error:", error);
        
        const errorMessage = getPasswordUpdateErrorMessage(error);
        
        toast({
          title: "Erreur",
          description: errorMessage,
          duration: 5000
        });

        if (shouldRedirectToForgotPassword(error)) {
          setTimeout(() => navigate("/mot-de-passe-oublie"), 2000);
        }
        return;
      }

      console.log("[RESET_PASSWORD_SUBMIT] Password updated successfully");
      setIsSuccess(true);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.",
        duration: 3000
      });

      // Sign out and redirect after successful password update
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      console.error("[RESET_PASSWORD_SUBMIT] Exception during password update:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du mot de passe.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleResetPassword, isLoading, isSuccess };
};
