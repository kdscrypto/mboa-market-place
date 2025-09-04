import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdsterraSystemCheck from "@/components/ads/AdsterraSystemCheck";

const AdsterraCheck = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnostic Système Adsterra
          </h1>
          <p className="text-gray-600">
            Vérification complète de l'intégration publicitaire pour la production
          </p>
        </div>
        
        <AdsterraSystemCheck />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ Cette page est uniquement pour les vérifications de développement</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdsterraCheck;