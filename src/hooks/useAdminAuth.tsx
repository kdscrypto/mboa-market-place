
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour gérer l'authentification et les permissions d'administration
 */
export const useAdminAuth = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Check authentication and admin status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const { data, error } = await supabase.rpc('is_admin_or_moderator');
          
          if (error) throw error;
          
          setIsAdmin(!!data);
          if (!data) {
            toast({
              title: "Accès restreint",
              description: "Vous n'avez pas les droits nécessaires pour modérer les annonces.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          toast({
            title: "Erreur",
            description: "Impossible de vérifier vos droits d'accès.",
            variant: "destructive"
          });
        }
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      // We'll recheck admin status when auth changes
      if (session) {
        checkAuthStatus();
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [toast]);
  
  return {
    isAuthLoading: isLoading,
    isAuthenticated,
    isAdmin,
    setAuthLoading: setIsLoading
  };
};
