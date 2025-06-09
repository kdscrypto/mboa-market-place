
import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "../validation/authSchemas";
import EmailField from "../components/EmailField";
import SecurityAlerts from "../components/SecurityAlerts";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";

interface ForgotPasswordFormContentProps {
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

const ForgotPasswordFormContent: React.FC<ForgotPasswordFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const { checkSecurity, isBlocked, blockEndTime } = useSecurityCheck();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const handleSecureSubmit = async (values: ForgotPasswordFormValues) => {
    // Vérifier la sécurité avant de demander la réinitialisation
    const securityCheck = await checkSecurity('password_reset', values.email, {
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
          <EmailField form={form} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading || isBlocked}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default ForgotPasswordFormContent;
