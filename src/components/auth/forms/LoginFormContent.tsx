
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, LoginFormValues } from "../validation/authSchemas";
import EnhancedEmailField from "../components/EnhancedEmailField";
import EnhancedPasswordField from "../components/EnhancedPasswordField";
import SecurityAlerts from "../components/SecurityAlerts";
import AccessibilityFeatures from "../components/AccessibilityFeatures";
import RealTimeValidation from "../components/RealTimeValidation";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";
import { useEnhancedSecurity } from "@/hooks/useEnhancedSecurity";
import { generateSecurityRecommendations } from "@/services/securityService";

interface LoginFormContentProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

const LoginFormContent: React.FC<LoginFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const { toast } = useToast();
  const { checkSecurity, validateInput, isBlocked, blockEndTime } = useSecurityCheck();
  const { isAnalyzing } = useEnhancedSecurity();
  const [attemptCount, setAttemptCount] = useState(0);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formStartTime] = useState(Date.now());
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const emailValue = form.watch("email");
  const passwordValue = form.watch("password");

  const handleSecureSubmit = async (values: LoginFormValues) => {
    // Validate inputs before processing
    const emailValid = await validateInput(values.email, 'email', 'email');
    const passwordValid = await validateInput(values.password, 'password', 'password');
    
    if (!emailValid || !passwordValid) {
      toast({
        title: "Entrée invalide",
        description: "Des éléments suspects ont été détectés dans votre saisie.",
        variant: "destructive"
      });
      return;
    }

    const securityCheck = await checkSecurity('login_attempt', values.email, {
      attempt_count: attemptCount + 1,
      user_agent: navigator.userAgent,
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      form_submission_time: Date.now(),
      form_completion_time: Date.now() - formStartTime
    });

    if (!securityCheck.allowed) {
      return;
    }

    try {
      await onSubmit(values);
      setAttemptCount(0);
    } catch (error) {
      setAttemptCount(prev => prev + 1);
      
      await checkSecurity('login_attempt', values.email, {
        attempt_count: attemptCount + 1,
        failed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        user_agent: navigator.userAgent,
        client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        form_completion_time: Date.now() - formStartTime
      });
      
      throw error;
    }
  };

  const recommendations = generateSecurityRecommendations(0, attemptCount);
  const formCompleteness = (emailValue ? 50 : 0) + (passwordValue ? 50 : 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-6">
          {/* Enhanced form completion indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Completion: {formCompleteness}%
                {isAnalyzing && <span className="ml-2 text-orange-600">(Analyse sécurisée...)</span>}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAccessibility(!showAccessibility)}
                className="text-xs"
              >
                Accessibilité
              </Button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isAnalyzing ? 'bg-orange-500 animate-pulse' : 'bg-mboa-orange'
                }`}
                style={{ width: `${formCompleteness}%` }}
              />
            </div>
          </div>

          {showAccessibility && (
            <AccessibilityFeatures 
              onTogglePasswordVisibility={() => setPasswordVisible(!passwordVisible)}
              passwordVisible={passwordVisible}
            />
          )}

          <SecurityAlerts 
            isBlocked={isBlocked} 
            blockEndTime={blockEndTime}
            attemptCount={attemptCount}
            showRecommendations={attemptCount > 1}
            recommendations={recommendations}
          />

          <RealTimeValidation 
            form={form}
            fields={['email']}
            showSuccessMessages={false}
          />
          
          <div className="space-y-4">
            <EnhancedEmailField form={form} showValidation={false} />
            <EnhancedPasswordField 
              form={form} 
              showForgotPassword={true}
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked || isAnalyzing}
          >
            {isLoading || isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isAnalyzing ? 'Vérification sécurisée...' : 'Connexion en cours...'}
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
