
import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginForm } from "./hooks/useAuthForm";
import LoginFormContent from "./forms/LoginFormContent";

interface LoginFormProps {
  redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectPath = "/mes-annonces" }) => {
  const { handleLogin, isLoading } = useLoginForm(redirectPath);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte Mboa Market
        </CardDescription>
      </CardHeader>
      
      <LoginFormContent 
        onSubmit={handleLogin} 
        isLoading={isLoading} 
      />
    </Card>
  );
};

export default LoginForm;
