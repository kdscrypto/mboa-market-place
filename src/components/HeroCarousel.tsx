
import React, { useEffect, useState } from 'react';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
  // Properly sized images for actual display dimensions (1335x288px)
  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&h=300&fit=crop&auto=format&q=75', // Landscape
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1400&h=300&fit=crop&auto=format&q=75', // Tech
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1400&h=300&fit=crop&auto=format&q=75', // Living room
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&h=300&fit=crop&auto=format&q=75', // Person with laptop
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

  // Prioritize first image preload for LCP optimization
  useEffect(() => {
    // Skip preloading since the first image is already preloaded in index.html
    // Just mark it as loaded when it actually loads
    setImagesLoaded(prev => {
      const newState = [...prev];
      
      // Preload remaining images after a short delay
      setTimeout(() => {
        images.slice(1).forEach((src, index) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImagesLoaded(prev => {
              const newState = [...prev];
              newState[index + 1] = true;
              // Check if all images are loaded
              if (newState.every(loaded => loaded)) {
                setAllLoaded(true);
              }
              return newState;
            });
          };
        });
      }, 100);
      
      return newState;
    });
  }, []);

  // Listen to carousel changes with throttling to reduce main thread work
  useEffect(() => {
    if (!emblaApi) return;
    
    // Throttle carousel updates to reduce main thread pressure
    let rafId: number;
    const onSelect = () => {
      // Cancel previous frame request
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      // Use requestAnimationFrame to avoid forced reflows
      rafId = requestAnimationFrame(() => {
        const newIndex = emblaApi.selectedScrollSnap();
        // Only update if index actually changed
        setCurrentIndex(prevIndex => prevIndex !== newIndex ? newIndex : prevIndex);
      });
    };
    
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
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
            <img 
              src={img}
              alt={`Mboa Market Featured ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-500",
                index === 0 ? "opacity-100" : (allLoaded ? "opacity-100" : "opacity-0")
              )}
              onLoad={() => {
                if (index === 0) {
                  setImagesLoaded(prev => {
                    const newState = [...prev];
                    newState[0] = true;
                    setAllLoaded(newState.every(loaded => loaded));
                    return newState;
                  });
                }
              }}
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
