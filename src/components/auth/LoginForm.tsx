
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "./validation/authSchemas";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";

interface LoginFormProps {
  redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectPath = "/mes-annonces" }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
        duration: 3000
      });
      // Redirect to the path that was provided or user dashboard
      navigate(redirectPath);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la connexion.",
        duration: 3000
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte Mboa Market
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            <EmailField form={form} />
            <PasswordField form={form} showForgotPassword={true} />
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            >
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginForm;
