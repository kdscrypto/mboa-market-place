
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
import UsernameField from "../components/UsernameField";
import PhoneField from "../components/PhoneField";
import PasswordField from "../components/PasswordField";
import TermsCheckbox from "../components/TermsCheckbox";

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
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      phone: "",
      // No default value for acceptTerms so user must explicitly check it
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <EmailField form={form} />
          <UsernameField form={form} />
          <PhoneField form={form} />
          <PasswordField form={form} />
          <TermsCheckbox 
            form={form} 
            onShowTerms={onShowTerms} 
          />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default RegisterFormContent;
