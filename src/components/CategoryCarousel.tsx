
import React from "react";
import { Category } from "@/data/categoriesData";
import CategoryCard from "@/components/CategoryCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface CategoryCarouselProps {
  categories: Category[];
  title: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, title }) => {
  // Configuration du plugin autoplay avec un délai de 3 secondes et direction inversée
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
      reverseDirection: true  // Défilement de droite à gauche
    })
  );

  // Initialisation du carousel avec direction verticale et plugin d'autoplay
  const [emblaRef] = useEmblaCarousel(
    { 
      axis: "y",      // Défilement vertical
      loop: true,     // Boucle infinie
      dragFree: true  // Glissement libre
    },
    [autoplayPlugin.current]
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="h-[500px] overflow-hidden">
        <Carousel 
          opts={{ 
            axis: "y", 
            loop: true 
          }}
          plugins={[autoplayPlugin.current]}
          className="h-full"
          orientation="vertical"
        >
          <CarouselContent className="-mt-4">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pt-4 basis-1/3 md:basis-1/4">
                <CategoryCard
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  coverImage={category.coverImage}
                  className="h-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default CategoryCarousel;
