
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
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        const authenticated = !!session;
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          console.log("User is authenticated, checking admin status...");
          // Vérifier si l'utilisateur a des droits d'administrateur ou de modérateur
          const { data, error } = await supabase.rpc('is_admin_or_moderator');
          
          if (error) throw error;
          
          console.log("Admin check result:", data);
          setIsAdmin(!!data);
          
          if (!data) {
            toast({
              title: "Accès restreint",
              description: "Vous n'avez pas les droits nécessaires pour modérer les annonces.",
              variant: "destructive"
            });
          }
        } else {
          console.log("User is not authenticated");
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier vos droits d'accès.",
          variant: "destructive"
        });
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setIsAuthenticated(!!session);
      
      // We'll recheck admin status when auth changes
      if (session) {
        checkAuthStatus();
      } else {
        setIsAdmin(false);
        setIsLoading(false);
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
