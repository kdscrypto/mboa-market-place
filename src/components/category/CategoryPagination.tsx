
import React from "react";
import { Button } from "@/components/ui/button";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryPagination: React.FC<CategoryPaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;
  
  const pageButtons = [];
  
  // Previous button
  pageButtons.push(
    <Button 
      key="prev" 
      variant="outline" 
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="px-3"
    >
      Précédent
    </Button>
  );
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <Button 
        key={i} 
        variant={i === currentPage ? "default" : "outline"} 
        onClick={() => onPageChange(i)}
        className="w-10 h-10"
      >
        {i}
      </Button>
    );
  }
  
  // Next button
  pageButtons.push(
    <Button 
      key="next" 
      variant="outline" 
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className="px-3"
    >
      Suivant
    </Button>
  );
  
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {pageButtons}
    </div>
  );
};

export default CategoryPagination;
