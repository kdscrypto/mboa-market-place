import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/LazyImage";
import { optimizeImage } from "@/utils/imageOptimization";
import { useOptimizedCallback } from "@/hooks/usePerformanceHooks";

interface AdCardProps {
  id: string;
  title: string;
  price: number;
  location: {
    city: string;
    region: string;
  };
  imageUrl?: string;
  isPremium?: boolean;
  createdAt: Date;
}

const AdCard = memo(({ id, title, price, location, imageUrl, isPremium, createdAt }: AdCardProps) => {
  // Memoized image error handler
  const handleImageError = useOptimizedCallback(() => {
    console.log('Image failed to load for ad:', id);
  }, [id]);

  // Format price with thousands separator
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  return (
    <Link to={`/annonce/${id}`} className="block group">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="relative">
          <LazyImage
            src={optimizeImage(imageUrl || '/placeholder.svg', { 
              width: 300, 
              height: 200, 
              quality: 80 
            })}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            placeholder="/placeholder.svg"
            onError={handleImageError}
          />
          {isPremium && (
            <Badge className="absolute top-2 right-2 bg-mboa-orange text-white">
              Premium
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-mboa-orange transition-colors">
            {title}
          </h3>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-mboa-orange">
              {formatPrice(price)} FCFA
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(createdAt)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>{location.city}, {location.region}</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

// Add display name for debugging
AdCard.displayName = 'AdCard';

export default AdCard;