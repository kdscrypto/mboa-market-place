
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Traitement du callback d'authentification");
        console.log("URL complète:", window.location.href);
        console.log("Search params:", window.location.search);
        console.log("Hash:", window.location.hash);
        
        // Attendre que Supabase traite automatiquement les tokens dans l'URL
        // Supabase gère automatiquement les tokens dans le hash fragment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Vérifier la session après le traitement automatique
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session récupérée:", session);
        console.log("Erreur de session:", sessionError);
        
        if (sessionError) {
          console.error("Erreur lors de la récupération de session:", sessionError);
          toast({
            title: "Erreur de session",
            description: "Impossible de traiter le lien d'authentification.",
            duration: 5000
          });
          navigate("/mot-de-passe-oublie");
          return;
        }

        if (session && session.user) {
          console.log("Session valide trouvée pour:", session.user.email);
          
          // Vérifier si c'est un recovery token (pour reset password)
          const isRecovery = session.user.recovery_sent_at || 
                           window.location.hash.includes('type=recovery') ||
                           window.location.search.includes('type=recovery');
          
          if (isRecovery) {
            console.log("Session de recovery détectée, redirection vers reset-password");
            toast({
              title: "Lien de réinitialisation valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
            });
            navigate("/reset-password");
          } else {
            console.log("Session de connexion normale");
            toast({
              title: "Connexion réussie",
              description: "Vous êtes maintenant connecté.",
              duration: 3000
            });
            navigate("/");
          }
        } else {
          console.log("Aucune session trouvée après traitement");
          
          // Vérifier s'il y a des paramètres d'erreur
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          const error = urlParams.get('error') || hashParams.get('error');
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
          
          if (error) {
            console.error("Erreur d'authentification:", error, errorDescription);
            let errorMessage = "Une erreur s'est produite lors de l'authentification.";
            
            if (error === 'access_denied') {
              errorMessage = "Accès refusé. Le lien pourrait être invalide ou expiré.";
            } else if (error === 'otp_expired') {
              errorMessage = "Le lien a expiré. Veuillez demander un nouveau lien de réinitialisation.";
            }
            
            toast({
              title: "Erreur d'authentification",
              description: errorMessage,
              duration: 5000
            });
          } else {
            toast({
              title: "Lien invalide",
              description: "Ce lien d'authentification est invalide ou a expiré.",
              duration: 5000
            });
          }
          
          navigate("/mot-de-passe-oublie");
        }
        
      } catch (error) {
        console.error("Erreur dans handleAuthCallback:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du traitement de l'authentification.",
          duration: 3000
        });
        navigate("/mot-de-passe-oublie");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mboa-orange mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-4">Traitement en cours...</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous vous redirigeons.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
