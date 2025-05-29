
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AdDetailErrorProps {
  error: string;
}

const AdDetailError: React.FC<AdDetailErrorProps> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold mb-4">Erreur</h2>
        <p className="text-gray-700 mb-6">{error || "Annonce introuvable"}</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-mboa-orange hover:bg-mboa-orange/90 text-white px-4 py-2 rounded"
          >
            Retour
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded ml-4"
          >
            Accueil
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdDetailError;
