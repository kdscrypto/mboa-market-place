
import React from 'react';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Jean Dupont",
      role: "Vendeur",
      content: "J'ai vendu ma voiture en moins de 3 jours grâce à Mboa Market. Le processus était simple et l'équipe très réactive.",
      avatar: "/placeholder.svg",
      rating: 5
    },
    {
      id: 2,
      name: "Marie Tamba",
      role: "Acheteuse",
      content: "Je cherchais un appartement à Douala et j'ai trouvé exactement ce que je voulais. La communication avec le vendeur était facile.",
      avatar: "/placeholder.svg",
      rating: 5
    },
    {
      id: 3,
      name: "Paul Ngo",
      role: "Vendeur régulier",
      content: "En tant que commerçant, je publie régulièrement des annonces sur Mboa Market. La plateforme m'a permis d'augmenter mes ventes de 30%.",
      avatar: "/placeholder.svg",
      rating: 4
    },
    {
      id: 4,
      name: "Sophie Kamga",
      role: "Acheteuse",
      content: "Service client très réactif et annonces de qualité. Je recommande Mboa Market à tous mes amis.",
      avatar: "/placeholder.svg",
      rating: 5
    }
  ];

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-center mb-8">Ce que nos utilisateurs disent</h2>
      
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-6 bg-white rounded-lg shadow-sm h-full mx-2">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                
                <div className="flex">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-mboa-orange text-mboa-orange" />
                  ))}
                  {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default TestimonialsSection;
