
import React from "react";
import { Loader2 } from "lucide-react";
import { Category } from "@/data/categoriesData";

interface CategoryResultsHeaderProps {
  category: Category | undefined;
  isLoading: boolean;
  totalCount: number;
}

const CategoryResultsHeader: React.FC<CategoryResultsHeaderProps> = ({ 
  category, 
  isLoading, 
  totalCount 
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">
        {category ? `Annonces dans ${category.name}` : 'Annonces'}
      </h2>
      <div className="flex flex-wrap justify-between items-center mt-2">
        <p className="text-gray-600">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 
              Recherche en cours...
            </span>
          ) : (
            <>
              <span className="font-semibold">{totalCount}</span> résultat{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default CategoryResultsHeader;
