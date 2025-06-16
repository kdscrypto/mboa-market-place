
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/ui/OptimizedImage';

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

  return (
    <Link to={`/annonce/${id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <AspectRatio ratio={1/1} className="bg-gray-100">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              width={300}
              height={300}
              className="w-full h-full"
              placeholder="/placeholder.svg"
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
