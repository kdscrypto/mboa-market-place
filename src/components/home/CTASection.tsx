
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection: React.FC = () => {
  return (
    <section className="bg-mboa-orange py-12 text-white">
      <div className="mboa-container text-center">
        <h2 className="text-2xl font-bold mb-4">
          Vous avez quelque chose à vendre ?
        </h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          En quelques clics, publiez votre annonce et touchez des milliers d'acheteurs potentiels dans tout le Cameroun.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-white text-mboa-orange hover:bg-gray-200"
        >
          <Link to="/publier-annonce">
            Publier une annonce maintenant
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
