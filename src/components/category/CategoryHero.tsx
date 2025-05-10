
import React from "react";
import { Category } from "@/data/categoriesData";

interface CategoryHeroProps {
  category: Category | undefined;
}

const CategoryHero: React.FC<CategoryHeroProps> = ({ category }) => {
  if (!category) return null;

  return (
    <div className="relative rounded-lg overflow-hidden mb-6 h-40">
      {/* Cover Image */}
      <div className="absolute inset-0">
        <img
          src={category.coverImage || '/placeholder.svg'}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {category.name}
          </h1>
          <p className="text-white text-opacity-90">
            Découvrez toutes les annonces dans cette catégorie
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;
