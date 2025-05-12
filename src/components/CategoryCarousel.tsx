
import React from "react";
import { Category } from "@/data/categoriesData";
import CategoryCard from "@/components/CategoryCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CategoryCarouselProps {
  categories: Category[];
  title?: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, title }) => {
  // Configuration du plugin autoplay avec un délai plus long (5 secondes)
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  );

  // Initialisation du carousel avec direction horizontale et plugin d'autoplay
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
