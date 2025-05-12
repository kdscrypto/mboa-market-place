
import React from 'react';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const HeroCarousel = () => {
  // Sample images for the carousel background - could be replaced with real featured ads later
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
            className="min-w-full h-full flex-shrink-0 relative"
          >
            <img 
              src={img}
              alt="Mboa Market" 
              className="w-full h-full object-cover"
            />
            {/* Optional: Add pagination indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`mx-1 w-2 h-2 rounded-full ${
                    i === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
