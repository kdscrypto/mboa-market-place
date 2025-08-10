
import React from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AdImageCarouselProps {
  images: string[];
  title: string;
}

const AdImageCarousel: React.FC<AdImageCarouselProps> = ({ images, title }) => {
  if (images.length === 0) return null;

  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={1/1}>
                <img 
                  src={image} 
                  alt={`${title} - Photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-white/70" />
            <CarouselNext className="right-2 bg-white/70" />
          </>
        )}
      </Carousel>
      
      {/* Image counter indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
          Photo 1/{images.length}
        </div>
      )}
    </div>
  );
};

export default AdImageCarousel;
