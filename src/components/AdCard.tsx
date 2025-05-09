
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

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
    <Link to={`/annonce/${id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={title}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
          
          <div className="mt-2 font-bold text-mboa-orange">
            {formattedPrice} {currency}
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location.city}</span>
          </div>
          
          <div className="text-xs text-gray-400 mt-2">{timeAgo}</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AdCard;
