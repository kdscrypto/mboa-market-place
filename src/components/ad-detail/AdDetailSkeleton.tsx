
import React from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-mboa-orange" />
        <span className="ml-2">Chargement de l'annonce...</span>
      </div>
      <Footer />
    </div>
  );
};

export default AdDetailSkeleton;
