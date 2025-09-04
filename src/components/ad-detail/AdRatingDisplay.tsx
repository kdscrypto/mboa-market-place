import React from "react";
import { Star } from "lucide-react";
import { AdRatingStats } from "@/services/adRatingService";
import { Skeleton } from "@/components/ui/skeleton";

interface AdRatingDisplayProps {
  stats: AdRatingStats | null;
  isLoading: boolean;
}

const AdRatingDisplay: React.FC<AdRatingDisplayProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className="h-4 w-4 fill-muted stroke-muted" 
            />
          ))}
        </div>
        <span className="text-sm">Aucune évaluation</span>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`h-4 w-4 ${
          star <= rating 
            ? "fill-yellow-400 stroke-yellow-400" 
            : "fill-muted stroke-muted"
        }`} 
      />
    ));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex">
          {renderStars(Math.round(stats.averageRating))}
        </div>
        <span className="font-medium">{stats.averageRating}</span>
        <span className="text-sm text-muted-foreground">
          ({stats.totalRatings} avis)
        </span>
      </div>
      
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2 text-xs">
              <span className="w-2">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdRatingDisplay;