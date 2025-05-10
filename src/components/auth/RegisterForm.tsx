
import React, { useState } from "react";
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
import { registerSchema, RegisterFormValues } from "./validation/authSchemas";
import EmailField from "./components/EmailField";
import UsernameField from "./components/UsernameField";
import PhoneField from "./components/PhoneField";
import PasswordField from "./components/PasswordField";
import TermsCheckbox from "./components/TermsCheckbox";
import TermsDialog from "./TermsDialog";

interface RegisterFormProps {
  redirectPath?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectPath = "/mes-annonces" }) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            phone: values.phone || null
          }
        }
      });
      
      if (authError) {
        toast({
          title: "Erreur d'inscription",
          description: authError.message,
          duration: 3000
        });
        return;
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.",
        duration: 5000
      });
      // Redirect to the path that was provided or dashboard
      navigate(redirectPath);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'inscription.",
        duration: 3000
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>
            Créez un compte pour publier des annonces
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)}>
            <CardContent className="space-y-4">
              <EmailField form={form} />
              <UsernameField form={form} />
              <PhoneField form={form} />
              <PasswordField form={form} />
              <TermsCheckbox 
                form={form} 
                onShowTerms={() => setIsTermsDialogOpen(true)} 
              />
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
              >
                Créer un compte
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <TermsDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
      />
    </>
  );
};

export default RegisterForm;
