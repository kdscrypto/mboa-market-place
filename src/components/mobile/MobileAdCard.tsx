
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface MobileAdCardProps {
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
  variant?: 'compact' | 'comfortable';
  showFavorite?: boolean;
}

const MobileAdCard: React.FC<MobileAdCardProps> = ({
  id,
  title,
  price,
  currency = 'XAF',
  location,
  imageUrl,
  createdAt,
  variant = 'comfortable',
  showFavorite = false
}) => {
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: fr
  });

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(price);

  const isCompact = variant === 'compact';

  return (
    <Link to={`/annonce/${id}`} className="block h-full">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]",
        "touch-manipulation"
      )}>
        <div className="relative">
          <AspectRatio ratio={isCompact ? 4/3 : 1/1} className="bg-gray-100">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              width={isCompact ? 200 : 300}
              height={isCompact ? 150 : 300}
              className="w-full h-full"
              placeholder="/placeholder.svg"
            />
            {showFavorite && (
              <button 
                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full touch-manipulation"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle favorite toggle
                }}
              >
                <Heart className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </AspectRatio>
        </div>
        
        <CardContent className={cn("p-3", isCompact && "p-2")}>
          <h3 className={cn(
            "font-semibold line-clamp-2 leading-tight",
            isCompact ? "text-sm" : "text-sm sm:text-base"
          )}>
            {title}
          </h3>
          
          <div className={cn(
            "mt-2 font-bold text-mboa-orange",
            isCompact ? "text-sm" : "text-sm sm:text-base"
          )}>
            {formattedPrice} {currency}
          </div>
          
          <div className={cn(
            "flex items-center mt-1 text-gray-500",
            isCompact ? "text-xs" : "text-xs sm:text-sm"
          )}>
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location.city}</span>
          </div>
          
          <div className={cn(
            "text-gray-400 mt-1",
            isCompact ? "text-xs" : "text-xs"
          )}>
            {timeAgo}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MobileAdCard;
