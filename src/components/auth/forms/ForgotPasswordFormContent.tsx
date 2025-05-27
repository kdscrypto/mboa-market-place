
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

interface ForgotPasswordFormContentProps {
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

const ForgotPasswordFormContent: React.FC<ForgotPasswordFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <EmailField form={form} />
          <div className="text-sm text-gray-600">
            Nous enverrons un lien de réinitialisation uniquement si cette adresse email est associée à un compte existant.
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default ForgotPasswordFormContent;
