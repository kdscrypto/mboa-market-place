
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
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Vérifier et gérer les tokens au chargement de la page
  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log("Paramètres URL actuels:", Object.fromEntries(searchParams.entries()));
      console.log("Hash de l'URL:", window.location.hash);
      
      // Vérifier s'il y a une erreur dans l'URL ou le hash
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      // Vérifier aussi dans le hash pour les erreurs
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashError = hashParams.get('error');
      const hashErrorDescription = hashParams.get('error_description');
      
      const finalError = errorParam || hashError;
      const finalErrorDescription = errorDescription || hashErrorDescription;
      
      if (finalError) {
        console.error("Erreur détectée:", finalError, finalErrorDescription);
        setIsValidToken(false);
        setIsCheckingToken(false);
        
        if (finalError === 'access_denied' && finalErrorDescription?.includes('expired')) {
          toast({
            title: "Lien expiré",
            description: "Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.",
            duration: 5000
          });
        } else {
          toast({
            title: "Lien invalide",
            description: finalErrorDescription || "Ce lien de réinitialisation est invalide.",
            duration: 5000
          });
        }
        return;
      }

      // Vérifier les tokens dans les paramètres normaux et dans le hash
      const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = searchParams.get('type') || hashParams.get('type');
      
      console.log("Tokens détectés:", { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        type,
        source: accessToken ? (searchParams.get('access_token') ? 'searchParams' : 'hash') : 'none'
      });

      if (type === 'recovery' && accessToken && refreshToken) {
        try {
          console.log("Tentative de définition de la session...");
          
          // Nettoyer l'URL en supprimant le hash s'il existe
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
          
          const { data, error } = await supabase.auth.setSession({
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
          } else {
            console.log("Session définie avec succès:", data);
            setIsValidToken(true);
            toast({
              title: "Lien valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
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
      } else {
        console.log("Paramètres manquants ou incorrects pour la réinitialisation");
        console.log("Redirection vers la page de mot de passe oublié...");
        setIsValidToken(false);
        // Ne pas afficher de toast ici, rediriger directement
        navigate("/mot-de-passe-oublie");
        return;
      }
      
      setIsCheckingToken(false);
    };

    handlePasswordReset();
  }, [searchParams, toast, navigate]);

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
      console.log("Tentative de mise à jour du mot de passe...");
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast({
          title: "Erreur",
          description: error.message,
          duration: 3000
        });
        return;
      }

      console.log("Mot de passe mis à jour avec succès");
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

  return { 
    handleResetPassword, 
    isLoading, 
    isSuccess, 
    isValidToken, 
    isCheckingToken 
  };
};
