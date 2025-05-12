
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CarouselSkeletonProps {
  count?: number;
}

const CarouselSkeleton: React.FC<CarouselSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="aspect-square rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default CarouselSkeleton;
