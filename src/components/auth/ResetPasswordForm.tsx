
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import ResetPasswordFormContent from "./forms/ResetPasswordFormContent";

const ResetPasswordForm: React.FC = () => {
  const { handleResetPassword, isLoading, isSuccess } = useResetPasswordForm();

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe mis à jour !</CardTitle>
          <CardDescription>
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>
          Entrez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      
      <ResetPasswordFormContent 
        onSubmit={handleResetPassword} 
        isLoading={isLoading} 
      />
    </Card>
  );
};

export default ResetPasswordForm;
