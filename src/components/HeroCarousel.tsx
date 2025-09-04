
import React, { useEffect, useState } from 'react';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
  // Real images for a more professional look
  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Landscape
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', // Tech
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04', // Living room
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', // Person with laptop
  ];

  // Track loaded state of images
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(images.map(() => false));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  // Auto-play configuration with improved settings
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 8000, // Longer delay for better user experience
      stopOnInteraction: false,
      stopOnMouseEnter: true, // Pause on mouse hover
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 80, // Smoother transition
      skipSnaps: false,
    },
    [autoplayPlugin.current]
  );

  // Preload images for better performance
  useEffect(() => {
    // Preload all images
    images.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          // Check if all images are loaded
          if (newState.every(loaded => loaded)) {
            setAllLoaded(true);
          }
          return newState;
        });
      };
    });
  }, []);

  // Listen to carousel changes
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      // Use requestAnimationFrame to avoid forced reflows
      requestAnimationFrame(() => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    };
    
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="w-full h-full relative" ref={emblaRef}>
      <div className="flex h-full transition-transform duration-1000">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="min-w-full h-full flex-shrink-0 relative"
          >
            {/* Add loading="lazy" and fade-in effect */}
            <img 
              src={img}
              alt={`Mboa Market Featured ${index + 1}`}
              loading="lazy"
              className={cn(
                "w-full h-full object-cover transition-opacity duration-500",
                allLoaded ? "opacity-100" : "opacity-0"
              )}
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
              "w-2 h-2 rounded-full transition-all duration-300",
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
