
import React from "react";
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

interface LoginFormContentProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
}

const LoginFormContent: React.FC<LoginFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <EmailField form={form} />
          <PasswordField form={form} showForgotPassword={true} />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default LoginFormContent;
