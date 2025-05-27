
import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "../validation/authSchemas";
import PasswordField from "../components/PasswordField";
import ConfirmPasswordField from "../components/ConfirmPasswordField";

interface ResetPasswordFormContentProps {
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

const ResetPasswordFormContent: React.FC<ResetPasswordFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <PasswordField form={form} showForgotPassword={false} />
          <ConfirmPasswordField form={form} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default ResetPasswordFormContent;
