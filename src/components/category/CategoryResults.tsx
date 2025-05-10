
import React from "react";
import { Ad } from "@/types/adTypes";
import AdCard from "@/components/AdCard";
import { Loader2, AlertCircle } from "lucide-react";
import NoResultsFound from "./NoResultsFound";

interface CategoryResultsProps {
  results: Ad[];
  isLoading: boolean;
  error: string | null;
}

const CategoryResults: React.FC<CategoryResultsProps> = ({ 
  results, 
  isLoading, 
  error 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mboa-orange" />
        <span className="ml-2">Chargement des résultats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {results.map((ad) => (
        <AdCard
          key={ad.id}
          id={ad.id}
          title={ad.title}
          price={ad.price}
          location={{
            city: ad.city,
            region: ad.region
          }}
          imageUrl={ad.imageUrl}
          createdAt={new Date(ad.created_at)}
        />
      ))}
    </div>
  );
};

export default CategoryResults;
