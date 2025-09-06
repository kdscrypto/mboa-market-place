
import React from "react";
import { Category } from "@/data/categoriesData";
import CategoryCard from "@/components/CategoryCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";

interface CategoryCarouselProps {
  categories: Category[];
  title?: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, title }) => {
  // Initialisation du carousel avec direction horizontale
  const [emblaRef] = useEmblaCarousel({
      axis: "x",
      loop: false, // Disable loop to reduce complexity
      dragFree: true,
      direction: "ltr",
      skipSnaps: false,
      duration: 30, // Faster transitions to reduce main thread blocking
    }
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
