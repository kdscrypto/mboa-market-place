
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoginFormValues, RegisterFormValues } from "../validation/authSchemas";

export const useLoginForm = (redirectPath: string = "/mes-annonces") => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
        duration: 3000
      });
      // Redirect to the path that was provided or user dashboard
      navigate(redirectPath);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};

export const useRegisterForm = (redirectPath: string = "/mes-annonces") => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            phone: values.phone || null
          }
        }
      });
      
      if (authError) {
        toast({
          title: "Erreur d'inscription",
          description: authError.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
        duration: 5000
      });
      // Redirect to the path that was provided or dashboard
      navigate(redirectPath);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription.",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading };
};
