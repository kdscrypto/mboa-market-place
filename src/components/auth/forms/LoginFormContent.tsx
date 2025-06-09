
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
import EnhancedEmailField from "../components/EnhancedEmailField";
import PasswordField from "../components/PasswordField";
import SecurityAlerts from "../components/SecurityAlerts";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";
import { generateSecurityRecommendations } from "@/services/securityService";

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
    // Enhanced security check before login attempt
    const securityCheck = await checkSecurity('login_attempt', values.email, {
      attempt_count: attemptCount + 1,
      user_agent: navigator.userAgent,
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      form_submission_time: Date.now()
    });

    if (!securityCheck.allowed) {
      return; // Error is already displayed by useSecurityCheck
    }

    try {
      await onSubmit(values);
      // Reset attempt counter on success
      setAttemptCount(0);
    } catch (error) {
      // Increment attempt counter on failure
      setAttemptCount(prev => prev + 1);
      
      // Log failed login attempt for security monitoring
      await checkSecurity('login_attempt', values.email, {
        attempt_count: attemptCount + 1,
        failed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        user_agent: navigator.userAgent,
        client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      throw error; // Re-throw error for parent component to handle
    }
  };

  const recommendations = generateSecurityRecommendations(0, attemptCount);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-4">
          <SecurityAlerts 
            isBlocked={isBlocked} 
            blockEndTime={blockEndTime}
            attemptCount={attemptCount}
            showRecommendations={attemptCount > 1}
            recommendations={recommendations}
          />
          
          <EnhancedEmailField form={form} showValidation={false} />
          <PasswordField form={form} showForgotPassword={true} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Connexion en cours...
              </div>
            ) : (
              "Se connecter"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default LoginFormContent;
