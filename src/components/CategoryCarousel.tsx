
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
  // Configuration du plugin autoplay avec un délai de 3 secondes
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
      // La propriété reverseDirection n'est pas supportée, à la place nous utilisons
      // direction dans les options du carousel
    })
  );

  // Initialisation du carousel avec direction horizontale et plugin d'autoplay
  const [emblaRef] = useEmblaCarousel(
    { 
      axis: "x",     // Défilement horizontal
      loop: true,    // Boucle infinie
      dragFree: true, // Glissement libre
      direction: "rtl" // Direction de droite à gauche
    },
    [autoplayPlugin.current]
  );

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[200px] md:min-w-[220px] p-2">
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
