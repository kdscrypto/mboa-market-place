
import { useState, useEffect } from "react";
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
  const [isValidToken, setIsValidToken] = useState(true);

  // Vérifier si le token est valide au chargement de la page
  useEffect(() => {
    const checkToken = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error("Erreur lors de la définition de la session:", error);
            setIsValidToken(false);
            toast({
              title: "Lien invalide",
              description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
              duration: 5000
            });
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          setIsValidToken(false);
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de la vérification du lien.",
            duration: 3000
          });
        }
      } else if (searchParams.get('error')) {
        // Si il y a une erreur dans l'URL
        setIsValidToken(false);
        toast({
          title: "Lien invalide",
          description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
          duration: 5000
        });
      }
    };

    checkToken();
  }, [searchParams, toast]);

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!isValidToken) {
      toast({
        title: "Erreur",
        description: "Session invalide. Veuillez demander un nouveau lien de réinitialisation.",
        duration: 3000
      });
      return;
    }

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

  return { handleResetPassword, isLoading, isSuccess, isValidToken };
};
