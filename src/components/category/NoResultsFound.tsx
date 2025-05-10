
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NoResultsFound: React.FC = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Aucune annonce trouvée</h2>
      <p className="text-gray-600 mb-6">
        Soyez le premier à publier une annonce dans cette catégorie!
      </p>
      <Button 
        asChild 
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        <Link to="/publier-annonce">
          Publier une annonce
        </Link>
      </Button>
    </div>
  );
};

export default NoResultsFound;
