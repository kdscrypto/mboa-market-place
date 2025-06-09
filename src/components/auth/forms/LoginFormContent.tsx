
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../validation/authSchemas";
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";
import SecurityAlerts from "../components/SecurityAlerts";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";

interface LoginFormContentProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

const LoginFormContent: React.FC<LoginFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const { checkSecurity, isBlocked, blockEndTime } = useSecurityCheck();
  const [attemptCount, setAttemptCount] = useState(0);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleSecureSubmit = async (values: LoginFormValues) => {
    // Vérifier la sécurité avant de tenter la connexion
    const securityCheck = await checkSecurity('login_attempt', values.email, {
      attempt_count: attemptCount + 1,
      user_agent: navigator.userAgent
    });

    if (!securityCheck.allowed) {
      return; // L'erreur est déjà affichée par useSecurityCheck
    }

    try {
      await onSubmit(values);
      // Réinitialiser le compteur en cas de succès
      setAttemptCount(0);
    } catch (error) {
      // Incrémenter le compteur en cas d'échec
      setAttemptCount(prev => prev + 1);
      
      // Enregistrer l'échec de connexion pour la détection d'activités suspectes
      await checkSecurity('login_attempt', values.email, {
        attempt_count: attemptCount + 1,
        failed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        user_agent: navigator.userAgent
      });
      
      throw error; // Relancer l'erreur pour que le composant parent puisse la gérer
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-4">
          <SecurityAlerts isBlocked={isBlocked} blockEndTime={blockEndTime} />
          
          <EmailField form={form} />
          <PasswordField form={form} showForgotPassword={true} />
          
          {attemptCount > 0 && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Tentative {attemptCount}/5. Après 5 échecs, votre compte sera temporairement bloqué.
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default LoginFormContent;
