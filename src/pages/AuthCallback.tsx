
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
        
        // Attendre que Supabase traite automatiquement les tokens dans l'URL
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
          navigate("/connexion");
          return;
        }

        if (session && session.user) {
          console.log("Session valide trouvée pour:", session.user.email);
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté.",
            duration: 3000
          });
          navigate("/");
        } else {
          console.log("Aucune session trouvée après traitement");
          toast({
            title: "Lien invalide",
            description: "Ce lien d'authentification est invalide ou a expiré.",
            duration: 5000
          });
          navigate("/connexion");
        }
        
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
