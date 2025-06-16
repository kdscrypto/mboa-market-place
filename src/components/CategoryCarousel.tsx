import React from "react";
import { Category } from "@/data/categoriesData";
import CategoryCard from "@/components/CategoryCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CategoryCarouselProps {
  categories: Category[];
  title?: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, title }) => {
  const isMobile = useIsMobile();

  // Mobile: Use native scrolling for better performance
  if (isMobile) {
    return (
      <div className="w-full">
        <div 
          className={cn(
            "flex gap-3 overflow-x-auto pb-2",
            "mobile-scroll mobile-carousel",
            "scrollbar-hide"
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}
        >
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={cn(
                "flex-shrink-0 w-[140px] sm:w-[160px]",
                "mobile-carousel-item"
              )}
            >
              <CategoryCard
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                coverImage={category.coverImage}
                className="h-32 sm:h-36 hover-scale touch-manipulation"
              />
            </div>
          ))}
        </div>
        
        {/* Mobile pagination dots */}
        <div className="flex justify-center mt-3">
          {categories.slice(0, Math.min(5, categories.length)).map((_, index) => (
            <div
              key={index}
              className={cn(
                "mx-1 w-2 h-2 rounded-full transition-colors",
                index === 0 ? "bg-mboa-orange" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Keep existing Embla carousel
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  );

  const [emblaRef] = useEmblaCarousel(
    { 
      axis: "x",
      loop: true,
      dragFree: true,
      direction: "ltr"
    },
    [autoplayPlugin.current]
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {categories.map((category) => (
          <div key={category.id} className="min-w-[240px] md:min-w-[280px] p-2">
            <CategoryCard
              name={category.name}
              slug={category.slug}
              icon={category.icon}
              coverImage={category.coverImage}
              className="h-full hover-scale"
            />
          </div>
        ))}
      </div>
      
      {/* Pagination indicators */}
      <div className="flex justify-center mt-4">
        {categories.slice(0, Math.min(6, categories.length)).map((_, index) => (
          <div
            key={index}
            className={`mx-1 w-2 h-2 rounded-full ${
              index === 0 ? "bg-mboa-orange" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
