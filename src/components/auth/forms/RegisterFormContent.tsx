
import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../validation/authSchemas";
import EnhancedEmailField from "../components/EnhancedEmailField";
import PasswordField from "../components/PasswordField";
import ConfirmPasswordField from "../components/ConfirmPasswordField";
import EnhancedUsernameField from "../components/EnhancedUsernameField";
import PhoneField from "../components/PhoneField";
import TermsCheckbox from "../components/TermsCheckbox";
import SecurityAlerts from "../components/SecurityAlerts";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";
import { generateSecurityRecommendations, validatePasswordStrength } from "@/services/securityService";

interface RegisterFormContentProps {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  onShowTerms: () => void;
  isLoading: boolean;
}

const RegisterFormContent: React.FC<RegisterFormContentProps> = ({ 
  onSubmit, 
  onShowTerms,
  isLoading 
}) => {
  const { checkSecurity, isBlocked, blockEndTime } = useSecurityCheck();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      phone: "",
      acceptTerms: false
    }
  });

  const passwordValue = form.watch("password");
  const passwordValidation = passwordValue ? validatePasswordStrength(passwordValue) : { score: 0, errors: [] };
  const usernameValue = form.watch("username");
  const emailValue = form.watch("email");

  // Calculate form completeness for better UX
  const isFormValid = form.formState.isValid && passwordValidation.score >= 3;
  const completionPercentage = Math.round(
    ((emailValue ? 20 : 0) + 
     (usernameValue ? 20 : 0) + 
     (passwordValue ? 20 : 0) + 
     (form.watch("confirmPassword") ? 20 : 0) + 
     (form.watch("acceptTerms") ? 20 : 0))
  );

  const handleSecureSubmit = async (values: RegisterFormValues) => {
    // Enhanced security check before account creation
    const securityCheck = await checkSecurity('account_creation', values.email, {
      username: values.username,
      phone: values.phone,
      user_agent: navigator.userAgent,
      password_strength: passwordValidation.score,
      form_completion_time: Date.now(), // Could track how fast form was filled
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    if (!securityCheck.allowed) {
      return; // Error is already displayed by useSecurityCheck
    }

    try {
      await onSubmit(values);
    } catch (error) {
      // Log failed registration attempt for security monitoring
      await checkSecurity('account_creation', values.email, {
        failed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        username: values.username,
        password_strength: passwordValidation.score
      });
      throw error;
    }
  };

  const recommendations = generateSecurityRecommendations(passwordValidation.score, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-mboa-orange h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <SecurityAlerts 
            isBlocked={isBlocked} 
            blockEndTime={blockEndTime}
            showRecommendations={passwordValidation.score < 4}
            recommendations={recommendations}
          />
          
          <EnhancedUsernameField form={form} />
          <EnhancedEmailField form={form} />
          <PhoneField form={form} />
          <PasswordField form={form} showStrengthIndicator={true} />
          <ConfirmPasswordField form={form} />
          <TermsCheckbox form={form} onShowTerms={onShowTerms} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked || !isFormValid}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Création en cours...
              </div>
            ) : (
              "Créer un compte"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default RegisterFormContent;
