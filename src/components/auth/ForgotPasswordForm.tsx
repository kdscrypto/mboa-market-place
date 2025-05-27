
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForgotPasswordForm } from "./hooks/useForgotPasswordForm";
import ForgotPasswordFormContent from "./forms/ForgotPasswordFormContent";

const ForgotPasswordForm: React.FC = () => {
  const { handleForgotPassword, isLoading, isSuccess } = useForgotPasswordForm();

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email envoyé !</CardTitle>
          <CardDescription>
            Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      
      <ForgotPasswordFormContent 
        onSubmit={handleForgotPassword} 
        isLoading={isLoading} 
      />
    </Card>
  );
};

export default ForgotPasswordForm;
