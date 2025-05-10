
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
  // Configuration du plugin autoplay avec un délai plus long (5 secondes au lieu de 3)
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000, // Plus lent: 5000ms = 5 secondes
      stopOnInteraction: true,
    })
  );

  // Initialisation du carousel avec direction horizontale et plugin d'autoplay
  const [emblaRef] = useEmblaCarousel(
    { 
      axis: "x",     // Défilement horizontal
      loop: true,    // Boucle infinie
      dragFree: true, // Glissement libre
      direction: "ltr" // Direction de gauche à droite (left to right)
    },
    [autoplayPlugin.current]
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[240px] md:min-w-[280px] p-2">
              <CategoryCard
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                coverImage={category.coverImage}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
