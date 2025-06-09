
import { supabase } from "@/integrations/supabase/client";

export const validateUserSession = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session error:", sessionError);
    throw new Error("Authentication error");
  }
  
  if (!session) {
    throw new Error("Connexion requise");
  }
  
  return session;
};
