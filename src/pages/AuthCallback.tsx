
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
        
        // Écouter les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change event:", event);
          console.log("Session:", session);
          
          if (event === 'PASSWORD_RECOVERY' && session) {
            // L'utilisateur a cliqué sur le lien de réinitialisation et une session temporaire a été créée
            console.log("PASSWORD_RECOVERY event détecté, redirection vers /reset-password");
            toast({
              title: "Lien valide",
              description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
              duration: 3000
            });
            navigate("/reset-password");
          } else if (event === 'SIGNED_IN' && session) {
            // Connexion normale réussie
            console.log("SIGNED_IN event détecté, redirection vers /");
            toast({
              title: "Connexion réussie",
              description: "Vous êtes maintenant connecté.",
              duration: 3000
            });
            navigate("/");
          } else if (event === 'SIGNED_OUT') {
            // Déconnexion
            console.log("SIGNED_OUT event détecté");
            navigate("/connexion");
          }
          
          // Nettoyer l'abonnement après traitement
          subscription.unsubscribe();
        });
        
        // Timeout de sécurité au cas où aucun événement ne se déclenche
        setTimeout(() => {
          console.log("Timeout atteint, redirection vers /connexion");
          subscription.unsubscribe();
          toast({
            title: "Lien invalide",
            description: "Ce lien d'authentification est invalide ou a expiré.",
            duration: 5000
          });
          navigate("/connexion");
        }, 5000);
        
      } catch (error) {
        console.error("Erreur dans handleAuthCallback:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du traitement de l'authentification.",
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
