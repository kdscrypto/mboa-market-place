
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HeroCarousel from "@/components/HeroCarousel";

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-mboa-orange to-mboa-orange/80 text-white overflow-hidden">
      {/* Hero Content */}
      <div className="mboa-container relative z-10 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            Bienvenue sur Mboa Market
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Achetez et vendez facilement au Cameroun
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-mboa-orange hover:bg-gray-100 hover-scale"
          >
            <Link 
              to="/connexion" 
              state={{ from: "/publier-annonce" }}
            >
              Publier une annonce gratuitement
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <HeroCarousel />
      </div>
    </div>
  );
};

export default HeroSection;
