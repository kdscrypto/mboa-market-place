
import React from "react";
import { Category } from "@/data/categoriesData";
import { Ad } from "@/types/adTypes";
import { AlertCircle } from "lucide-react";
import CategoryHero from "./CategoryHero";
import CategoryResultsHeader from "./CategoryResultsHeader";
import CategoryResults from "./CategoryResults";
import CategoryPagination from "./CategoryPagination";

interface CategoryPageContentProps {
  category: Category | undefined;
  results: Ad[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryPageContent: React.FC<CategoryPageContentProps> = ({
  category,
  results,
  totalCount,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="mboa-container py-6">
      {/* Category Hero */}
      <CategoryHero category={category} />
      
      {/* Search Results */}
      <div className="bg-white border rounded-lg p-6">
        <CategoryResultsHeader 
          category={category}
          isLoading={isLoading}
          totalCount={totalCount}
        />
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        
        <CategoryResults 
          results={results}
          isLoading={isLoading}
          error={error}
        />
        
        <CategoryPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default CategoryPageContent;
