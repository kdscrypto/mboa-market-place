
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { optimizeImage } from '@/utils/imageOptimization';

interface AdCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: {
    city: string;
    region?: string;
  };
  imageUrl: string;
  createdAt: Date;
}

const AdCard: React.FC<AdCardProps> = ({
  id,
  title,
  price,
  currency = 'XAF',
  location,
  imageUrl,
  createdAt
}) => {
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: fr
  });

  // Format price with thousands separator
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(price);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Optimize image URL for better performance
  const optimizedImageUrl = imageError ? '/placeholder.svg' : optimizeImage(imageUrl, { 
    width: 350, 
    height: 350, 
    quality: 80 
  });

  return (
    <Link to={`/annonce/${id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <AspectRatio ratio={1/1} className="bg-gray-100">
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="sr-only">Chargement de l'image...</span>
              </div>
            )}
            
            {/* Actual image */}
            <img
              src={optimizedImageUrl}
              alt={title}
              className={cn(
                "object-cover w-full h-full transition-opacity duration-200",
                imageLoaded && !imageError ? "opacity-100" : "opacity-0"
              )}
              style={{
                objectFit: 'cover',
              }}
              onError={(e) => {
                console.error(`Image error for ad: ${id}, URL: ${imageUrl}`);
                setImageError(true);
                setImageLoaded(true);
              }}
              onLoad={() => {
                console.log(`Image loaded successfully for ad: ${id}`);
                setImageLoaded(true);
              }}
              loading="lazy"
              crossOrigin="anonymous"
            />
          </AspectRatio>
        </div>
        
        <CardContent className="p-2">
          <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{title}</h3>
          
          <div className="mt-1 font-bold text-mboa-orange text-xs sm:text-sm">
            {formattedPrice} {currency}
          </div>
          
          <div className="flex items-center mt-0.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[90%]">{location.city}</span>
          </div>
          
          <div className="text-xs text-gray-400 mt-1">{timeAgo}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AdCard;
