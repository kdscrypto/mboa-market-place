
import React, { useState } from "react";
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
import EnhancedPasswordField from "../components/EnhancedPasswordField";
import ConfirmPasswordField from "../components/ConfirmPasswordField";
import EnhancedUsernameField from "../components/EnhancedUsernameField";
import EnhancedPhoneField from "../components/EnhancedPhoneField";
import TermsCheckbox from "../components/TermsCheckbox";
import SecurityAlerts from "../components/SecurityAlerts";
import FormProgressIndicator from "../components/FormProgressIndicator";
import RealTimeValidation from "../components/RealTimeValidation";
import AccessibilityFeatures from "../components/AccessibilityFeatures";
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
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formStartTime] = useState(Date.now());
  
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
  const confirmPasswordValue = form.watch("confirmPassword");
  const acceptTerms = form.watch("acceptTerms");

  // Calculate form steps for progress indicator
  const formSteps = [
    {
      id: "personal",
      label: "Personnel",
      completed: !!(usernameValue && emailValue),
      hasError: !!form.formState.errors.username || !!form.formState.errors.email
    },
    {
      id: "contact", 
      label: "Contact",
      completed: !!form.watch("phone"),
      hasError: !!form.formState.errors.phone
    },
    {
      id: "security",
      label: "Sécurité", 
      completed: !!(passwordValue && confirmPasswordValue && passwordValidation.score >= 70),
      hasError: !!form.formState.errors.password || !!form.formState.errors.confirmPassword
    },
    {
      id: "terms",
      label: "Conditions",
      completed: acceptTerms,
      hasError: !!form.formState.errors.acceptTerms
    }
  ];

  const getCurrentStep = () => {
    if (!usernameValue || !emailValue) return "personal";
    if (!form.watch("phone")) return "contact";
    if (!passwordValue || !confirmPasswordValue || passwordValidation.score < 70) return "security";
    if (!acceptTerms) return "terms";
    return "complete";
  };

  const isFormValid = form.formState.isValid && passwordValidation.score >= 70;
  const completionPercentage = Math.round(
    (formSteps.filter(step => step.completed).length / formSteps.length) * 100
  );

  const handleSecureSubmit = async (values: RegisterFormValues) => {
    const securityCheck = await checkSecurity('account_creation', values.email, {
      username: values.username,
      phone: values.phone,
      user_agent: navigator.userAgent,
      password_strength: passwordValidation.score,
      form_completion_time: Date.now() - formStartTime,
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      form_submission_time: Date.now()
    });

    if (!securityCheck.allowed) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      await checkSecurity('account_creation', values.email, {
        failed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        username: values.username,
        password_strength: passwordValidation.score,
        form_completion_time: Date.now() - formStartTime
      });
      throw error;
    }
  };

  const recommendations = generateSecurityRecommendations(passwordValidation.score, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <FormProgressIndicator 
            steps={formSteps}
            currentStep={getCurrentStep()}
          />

          {/* Accessibility features toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Progression: {completionPercentage}%
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

          {showAccessibility && (
            <AccessibilityFeatures 
              onTogglePasswordVisibility={() => setPasswordVisible(!passwordVisible)}
              passwordVisible={passwordVisible}
            />
          )}

          <SecurityAlerts 
            isBlocked={isBlocked} 
            blockEndTime={blockEndTime}
            showRecommendations={passwordValidation.score < 70}
            recommendations={recommendations}
          />

          {/* Real-time validation for all fields */}
          <RealTimeValidation 
            form={form}
            fields={['email', 'username', 'password']}
            showSuccessMessages={false}
          />
          
          <div className="space-y-4">
            <EnhancedUsernameField form={form} />
            <EnhancedEmailField form={form} />
            <EnhancedPhoneField form={form} />
            <EnhancedPasswordField 
              form={form} 
              showStrengthIndicator={true}
              showPasswordGenerator={true}
              autoComplete="new-password"
            />
            <ConfirmPasswordField form={form} />
            <TermsCheckbox form={form} onShowTerms={onShowTerms} />
          </div>
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
