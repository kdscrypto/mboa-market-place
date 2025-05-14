
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  // Process image URL to handle cache issues
  const processImageUrl = (url: string): string => {
    if (!url || url === '/placeholder.svg') return '/placeholder.svg';
    
    // If it's a Supabase URL, add cache busting parameter
    if (url.includes('supabase.co/storage/v1/object/public')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${new Date().getTime()}`;
    }
    
    return url;
  };

  return (
    <Link to={`/annonce/${id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse">
              <span className="sr-only">Chargement de l'image...</span>
            </div>
          )}
          
          <img
            src={imageError ? '/placeholder.svg' : processImageUrl(imageUrl)}
            alt={title}
            className={cn(
              "object-cover w-full h-full",
              !imageLoaded && !imageError ? "opacity-0" : "opacity-100"
            )}
            onError={(e) => {
              console.error(`Image error for ad: ${id}, URL: ${imageUrl}`);
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
              setImageError(true);
            }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            crossOrigin="anonymous"
          />
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
