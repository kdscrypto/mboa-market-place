
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-mboa-gray">
        <div className="mboa-container max-w-md">
          <div className="mb-6">
            <Link 
              to="/connexion" 
              className="inline-flex items-center gap-2 text-mboa-orange hover:text-mboa-orange/80 text-sm mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
          
          <ResetPasswordForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
