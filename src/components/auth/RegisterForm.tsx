
import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegisterForm } from "./hooks/useAuthForm";
import RegisterFormContent from "./forms/RegisterFormContent";
import TermsDialog from "./TermsDialog";

interface RegisterFormProps {
  redirectPath?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectPath = "/mes-annonces" }) => {
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const { handleRegister, isLoading } = useRegisterForm(redirectPath);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>
            Créez un compte pour publier des annonces
          </CardDescription>
        </CardHeader>
        
        <RegisterFormContent 
          onSubmit={handleRegister}
          onShowTerms={() => setIsTermsDialogOpen(true)}
          isLoading={isLoading}
        />
      </Card>
      
      <TermsDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
      />
    </>
  );
};

export default RegisterForm;
