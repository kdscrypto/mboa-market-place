
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import ResetPasswordFormContent from "./forms/ResetPasswordFormContent";

const ResetPasswordForm: React.FC = () => {
  const { handleResetPassword, isLoading, isSuccess, isReady } = useResetPasswordForm();

  // Affichage pendant la vérification
  if (!isReady && !isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification...</CardTitle>
          <CardDescription>
            Vérification du lien de réinitialisation en cours...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Affichage après succès
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe mis à jour !</CardTitle>
          <CardDescription>
            Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Formulaire de réinitialisation
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
