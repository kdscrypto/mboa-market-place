
import { supabase } from "@/integrations/supabase/client";

/**
 * Service pour gérer l'authentification et les permissions pour les annonces
 */
export const validateAdServiceAuth = async (): Promise<void> => {
  // Vérifier si l'utilisateur est connecté
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session error:", sessionError);
    throw sessionError;
  }
  
  if (!session) {
    console.error("No active session found");
    throw new Error("Authentication required");
  }
  
  // Check if user has admin/moderator privileges
  const { data: hasAccess, error: accessError } = await supabase.rpc('is_admin_or_mod');
  
  if (accessError) {
    console.error("Error checking access privileges:", accessError);
    throw new Error("Access verification failed");
  }
  
  if (!hasAccess) {
    console.error("User does not have required privileges");
    throw new Error("Insufficient privileges");
  }
};
