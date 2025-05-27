
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResetPasswordFormValues } from "../validation/authSchemas";

export const useResetPasswordForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
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
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
        duration: 3000
      });

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/connexion");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
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
