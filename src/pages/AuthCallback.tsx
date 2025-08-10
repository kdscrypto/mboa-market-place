
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("[AUTH_CALLBACK] Component mounted, processing auth callback");
    
    const handleAuthCallback = async () => {
      try {
        // Écouter les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[AUTH_CALLBACK] Auth state change:", { event, hasSession: !!session });
          
          if (event === 'PASSWORD_RECOVERY') {
            console.log("[AUTH_CALLBACK] PASSWORD_RECOVERY event detected, redirecting to reset password");
            subscription.unsubscribe();
            navigate("/reinitialiser-mot-de-passe", { replace: true });
          } else if (event === 'SIGNED_IN' && session) {
            console.log("[AUTH_CALLBACK] Normal sign in detected, redirecting to home");
            subscription.unsubscribe();
            toast({
              title: "Connexion réussie",
              description: "Vous êtes maintenant connecté.",
              duration: 3000
            });
            navigate("/", { replace: true });
          } else if (event === 'SIGNED_OUT') {
            console.log("[AUTH_CALLBACK] Sign out detected");
            subscription.unsubscribe();
            navigate("/connexion", { replace: true });
          }
        });
        
        // Timeout de sécurité
        setTimeout(() => {
          console.log("[AUTH_CALLBACK] Timeout reached, redirecting to login");
          subscription.unsubscribe();
          toast({
            title: "Lien invalide",
            description: "Ce lien d'authentification est invalide ou a expiré.",
            duration: 5000
          });
          navigate("/connexion", { replace: true });
        }, 6000);
        
      } catch (error) {
        console.error("[AUTH_CALLBACK] Error in handleAuthCallback:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du traitement de l'authentification.",
          duration: 3000
        });
        navigate("/connexion", { replace: true });
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
