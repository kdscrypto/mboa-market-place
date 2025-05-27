
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
        console.log("URL actuelle:", window.location.href);
        
        // Extraire les paramètres de l'URL (query params et fragment)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const type = urlParams.get('type') || hashParams.get('type');
        const error = urlParams.get('error') || hashParams.get('error');
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
        
        console.log("Type détecté:", type);
        console.log("Erreur:", error);
        
        // Gérer les erreurs d'authentification
        if (error) {
          console.error("Erreur d'authentification:", error);
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
          navigate("/mot-de-passe-oublie");
          return;
        }

        // Si c'est un recovery, rediriger vers reset-password
        if (type === 'recovery') {
          console.log("Recovery détecté, redirection vers reset-password");
          
          // Vérifier la session après un court délai
          setTimeout(async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("Erreur de session:", sessionError);
              toast({
                title: "Erreur",
                description: "Problème avec le lien de réinitialisation.",
                duration: 3000
              });
              navigate("/mot-de-passe-oublie");
              return;
            }

            if (session) {
              console.log("Session de recovery valide trouvée");
              toast({
                title: "Lien valide",
                description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
                duration: 3000
              });
              navigate("/reset-password");
            } else {
              console.log("Aucune session de recovery trouvée");
              toast({
                title: "Lien invalide",
                description: "Ce lien de réinitialisation est invalide ou a expiré.",
                duration: 5000
              });
              navigate("/mot-de-passe-oublie");
            }
          }, 500);
          
          return;
        }

        // Pour les autres types d'authentification (connexion normale)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session normale trouvée");
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté.",
            duration: 3000
          });
          navigate("/");
        } else {
          console.log("Aucune session trouvée, redirection vers connexion");
          navigate("/connexion");
        }
        
      } catch (error) {
        console.error("Erreur dans handleAuthCallback:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'authentification.",
          duration: 3000
        });
        navigate("/connexion");
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
