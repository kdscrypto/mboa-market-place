
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
  const { handleResetPassword, isLoading, isSuccess, isReady, isChecking } = useResetPasswordForm();

  // Affichage pendant la vérification
  if (isChecking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification...</CardTitle>
          <CardDescription>
            Vérification du lien de réinitialisation en cours...
          </CardDescription>
        </CardHeader>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mboa-orange"></div>
          </div>
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
            Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
          </CardDescription>
        </CardHeader>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            <span className="ml-2 text-green-600">Redirection en cours...</span>
          </div>
        </div>
      </Card>
    );
  }

  // Show the form whether isReady is true or false - let the user try
  // This prevents the premature "Lien invalide" message
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau mot de passe</CardTitle>
        <CardDescription>
          {isReady 
            ? "Entrez votre nouveau mot de passe" 
            : "Entrez votre nouveau mot de passe (session en cours de validation)"}
        </CardDescription>
      </CardHeader>
      
      <ResetPasswordFormContent 
        onSubmit={handleResetPassword} 
        isLoading={isLoading} 
      />
      
      {!isReady && (
        <div className="px-6 pb-4">
          <p className="text-sm text-yellow-600">
            Si vous rencontrez des difficultés, veuillez{" "}
            <Link to="/mot-de-passe-oublie" className="text-mboa-orange hover:underline">
              demander un nouveau lien
            </Link>.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ResetPasswordForm;
