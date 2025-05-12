
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    const checkUser = async () => {
      setLoading(true);
      
      try {
        console.log("Checking for existing session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing session");
          setUser(session.user);
        } else {
          console.log("No existing session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (!user) {
    // Save the current location to redirect back after login
    console.log("User not authenticated, redirecting to login page");
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

export default AuthGuard;
