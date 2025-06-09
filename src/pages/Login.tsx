
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useLocation } from "react-router-dom";

const Login = () => {
  const location = useLocation();
  const fromPage = (location.state as { from?: string })?.from || "/dashboard";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 bg-mboa-gray">
        <div className="mboa-container max-w-md">
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              {fromPage === "/publier-annonce" 
                ? "Connectez-vous ou créez un compte pour publier votre annonce gratuitement."
                : "Connectez-vous à votre compte Mboa Market."
              }
            </p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm redirectPath={fromPage} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm redirectPath={fromPage} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
