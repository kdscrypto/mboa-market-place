
import React, { useEffect, useState } from 'react';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import OptimizedImage from '@/components/ui/OptimizedImage';

const HeroCarousel = () => {
  // Optimized image URLs with specific dimensions
  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=600&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop&auto=format&q=80',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Optimized auto-play configuration
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 60,
      skipSnaps: false,
      startIndex: 0,
    },
    [autoplayPlugin.current]
  );

  // Initialize carousel and handle ready state
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    
    const onReady = () => {
      setIsReady(true);
    };
    
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onReady);
    
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onReady);
    };
  }, [emblaApi]);

  return (
    <div className="w-full h-full relative" ref={emblaRef}>
      <div className={cn(
        "flex h-full transition-opacity duration-500",
        isReady ? "opacity-100" : "opacity-0"
      )}>
        {images.map((img, index) => (
          <div 
            key={index} 
            className="min-w-full h-full flex-shrink-0 relative"
          >
            <OptimizedImage
              src={img}
              alt={`Mboa Market Featured ${index + 1}`}
              priority={index === 0} // Prioritize first image
              width={1200}
              height={600}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
      
      {/* Improved pagination indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50",
              i === currentIndex 
                ? "bg-white w-4" 
                : "bg-white/50 hover:bg-white/80"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
