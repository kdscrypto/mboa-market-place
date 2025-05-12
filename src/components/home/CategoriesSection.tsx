
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import CategoryCarousel from "@/components/CategoryCarousel";
import { Category } from "@/data/categoriesData";

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories }) => {
  return (
    <div className="mboa-container mb-12 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Catégories populaires</h2>
        <Button variant="ghost" asChild className="text-mboa-orange hover:text-mboa-orange/80">
          <Link to="/categories" className="flex items-center gap-1">
            Voir toutes <ChevronRight size={16} />
          </Link>
        </Button>
      </div>
      <CategoryCarousel 
        categories={categories}
      />
    </div>
  );
};

export default CategoriesSection;
