
import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ad } from '@/types/adTypes';
import PremiumBadge from '@/components/PremiumBadge';

interface AdCardItemProps {
  ad: Ad;
}

const AdCardItem: React.FC<AdCardItemProps> = ({ ad }) => {
  return (
    <div className="relative h-full">
      <Link 
        to={`/annonce/${ad.id}`} 
        className="h-full block"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-md">
          <img
            src={ad.imageUrl || '/placeholder.svg'}
            alt={ad.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log("Favorite clicked for:", ad.id);
            }}
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="font-bold text-white text-sm md:text-base">
              {new Intl.NumberFormat('fr-FR').format(ad.price)} XAF
            </div>
          </div>
        </div>
        <div className="p-2 bg-white rounded-b-md border-x border-b">
          <h3 className="font-medium text-xs sm:text-sm line-clamp-1">{ad.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ad.city}</p>
        </div>
      </Link>
      {ad.is_premium && (
        <div className="absolute top-2 left-2">
          <PremiumBadge className="z-20 scale-75" />
        </div>
      )}
    </div>
  );
};

export default AdCardItem;
