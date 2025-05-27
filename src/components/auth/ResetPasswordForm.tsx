
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
  const { handleResetPassword, isLoading, isSuccess, isValidToken, isCheckingToken } = useResetPasswordForm();

  // Affichage pendant la vérification du token
  if (isCheckingToken) {
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

  // Affichage si le token est invalide
  if (!isValidToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lien invalide</CardTitle>
          <CardDescription>
            Ce lien de réinitialisation de mot de passe est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0">
          <Link to="/mot-de-passe-oublie">
            <Button className="w-full bg-mboa-orange hover:bg-mboa-orange/90">
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
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
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
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
