
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
import EmailField from "../components/EmailField";
import PasswordField from "../components/PasswordField";
import ConfirmPasswordField from "../components/ConfirmPasswordField";
import UsernameField from "../components/UsernameField";
import PhoneField from "../components/PhoneField";
import TermsCheckbox from "../components/TermsCheckbox";
import SecurityAlerts from "../components/SecurityAlerts";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";

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

  const handleSecureSubmit = async (values: RegisterFormValues) => {
    // Vérifier la sécurité avant de créer le compte
    const securityCheck = await checkSecurity('account_creation', values.email, {
      username: values.username,
      phone: values.phone,
      user_agent: navigator.userAgent
    });

    if (!securityCheck.allowed) {
      return; // L'erreur est déjà affichée par useSecurityCheck
    }

    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSecureSubmit)}>
        <CardContent className="space-y-4">
          <SecurityAlerts isBlocked={isBlocked} blockEndTime={blockEndTime} />
          
          <UsernameField form={form} />
          <EmailField form={form} />
          <PhoneField form={form} />
          <PasswordField form={form} showStrengthIndicator={true} />
          <ConfirmPasswordField form={form} />
          <TermsCheckbox form={form} onShowTerms={onShowTerms} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked}
          >
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default RegisterFormContent;
