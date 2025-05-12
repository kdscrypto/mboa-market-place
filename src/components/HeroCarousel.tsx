
import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const HeroCarousel = () => {
  // Sample images for the carousel background
  const images = [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ];

  // Auto-play configuration
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
    })
  );

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      duration: 60,
      skipSnaps: false
    },
    [autoplayPlugin.current]
  );

  return (
    <div className="w-full h-full" ref={emblaRef}>
      <div className="flex h-full transition-transform duration-1000">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="min-w-full h-full flex-shrink-0"
          >
            <img 
              src={img}
              alt="Mboa Market" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
