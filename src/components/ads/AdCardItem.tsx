
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ad } from '@/types/adTypes';
import PremiumBadge from '@/components/PremiumBadge';
import { toast } from '@/components/ui/use-toast';

interface AdCardItemProps {
  ad: Ad;
}

const AdCardItem: React.FC<AdCardItemProps> = ({ ad }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  
  // Utiliser un placeholder par défaut
  const defaultPlaceholder = '/placeholder.svg';
  
  // Reset l'état d'erreur si l'URL de l'image change
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setImageAttempts(0);
  }, [ad.imageUrl]);
  
  const handleImageError = () => {
    console.log("Image error for ad:", ad.id);
    // Limiter les tentatives de rechargement
    if (imageAttempts < 2) {
      setImageAttempts(prev => prev + 1);
      // Tentative avec un timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const newUrl = `${ad.imageUrl}?t=${timestamp}`;
      const img = new Image();
      img.src = newUrl;
      img.onload = () => {
        setImageError(false);
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
    } else {
      setImageError(true);
      setImageLoaded(true);
    }
  };
  
  const handleImageLoaded = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  const imageUrl = imageError ? defaultPlaceholder : (ad.imageUrl || defaultPlaceholder);
  
  return (
    <div className="relative h-full">
      <Link 
        to={`/annonce/${ad.id}`} 
        className="h-full block"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-md">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="sr-only">Chargement de l'image...</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt={ad.title}
            className={`object-cover w-full h-full transition-transform duration-300 hover:scale-105 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoaded}
            loading="lazy"
          />
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log("Favorite clicked for:", ad.id);
              toast({
                description: "Fonctionnalité à venir",
              });
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
