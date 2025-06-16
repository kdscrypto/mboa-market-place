
import React, { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface AdImageCarouselProps {
  images: string[];
  title: string;
}

const AdImageCarousel: React.FC<AdImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (images.length === 0) return null;

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      <Carousel 
        className="w-full"
        onSelect={() => {
          // Update current index when carousel changes
          const carousel = document.querySelector('[data-embla-carousel]');
          if (carousel) {
            const slides = carousel.querySelectorAll('[data-embla-slide]');
            slides.forEach((slide, index) => {
              if (slide.classList.contains('is-selected')) {
                setCurrentIndex(index);
              }
            });
          }
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={1/1}>
                <OptimizedImage
                  src={image}
                  alt={`${title} - Photo ${index + 1}`}
                  priority={index === 0} // Prioritize first image
                  width={800}
                  height={800}
                  className="w-full h-full"
                  placeholder="/placeholder.svg"
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-white/70 hover:bg-white/90 transition-colors" />
            <CarouselNext className="right-2 bg-white/70 hover:bg-white/90 transition-colors" />
          </>
        )}
      </Carousel>
      
      {/* Image counter indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          Photo {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

export default AdImageCarousel;
