
import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Ad } from '@/types/adTypes';
import PremiumBadge from '@/components/PremiumBadge';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AdCardItemProps {
  ad: Ad;
}

const AdCardItem: React.FC<AdCardItemProps> = ({ ad }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCount = useRef(0);
  const isMobile = useIsMobile();
  
  // Placeholder that will be shown when image fails to load
  const defaultPlaceholder = '/placeholder.svg';
  
  // Reset the state when the ad changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    retryCount.current = 0;
    setIsRetrying(false);
  }, [ad.id, ad.imageUrl]);
  
  const handleImageError = () => {
    // If we're already retrying, don't trigger another retry
    if (isRetrying) return;
    
    console.error(`Image error for ad: ${ad.id}, URL: ${ad.imageUrl || 'undefined'}`);
    
    // Limit retries to prevent infinite loops
    if (retryCount.current < 2) {
      setIsRetrying(true);
      retryCount.current += 1;
      
      // Try again with a cache-busting parameter
      const timestamp = new Date().getTime();
      const newUrl = ad.imageUrl ? `${ad.imageUrl}?t=${timestamp}` : defaultPlaceholder;
      
      const img = new Image();
      img.src = newUrl;
      img.crossOrigin = "anonymous"; // Add CORS attribute to preload image
      
      img.onload = () => {
        setImageError(false);
        setImageLoaded(true);
        setIsRetrying(false);
        
        // Force a re-render with the new URL
        const imgElement = document.querySelector(`img[data-ad-id="${ad.id}"]`) as HTMLImageElement;
        if (imgElement) {
          imgElement.src = newUrl;
        }
      };
      
      img.onerror = () => {
        console.error(`Retry failed for ad: ${ad.id}, URL: ${newUrl}`);
        setImageError(true);
        setImageLoaded(true);
        setIsRetrying(false);
      };
    } else {
      console.warn(`Max retries reached for ad: ${ad.id}, using placeholder`);
      setImageError(true);
      setImageLoaded(true);
    }
  };
  
  const handleImageLoaded = () => {
    console.log(`Image loaded successfully for ad: ${ad.id}`);
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Process image URL before rendering
  const processImageUrl = (url: string | undefined): string => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return defaultPlaceholder;
    }
    
    // If it's a Supabase URL, add cache busting parameter
    if (url.includes('supabase.co/storage/v1/object/public')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${new Date().getTime()}`;
    }
    
    return url;
  };
  
  // Determine the correct image URL to use
  const imageUrl = imageError ? defaultPlaceholder : processImageUrl(ad.imageUrl);
  
  // Apply specific fix for desktop browsers with proper types
  const imageStyle: CSSProperties = isMobile ? {} : { 
    objectFit: 'cover' as 'cover', 
    width: '100%', 
    height: '100%',
  };
  
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
            className={cn(
              "transition-transform duration-300 hover:scale-105",
              !imageLoaded ? "opacity-0" : "opacity-100"
            )}
            style={imageStyle}
            onError={handleImageError}
            onLoad={handleImageLoaded}
            loading="lazy"
            crossOrigin="anonymous"
            data-ad-id={ad.id}
          />
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
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
