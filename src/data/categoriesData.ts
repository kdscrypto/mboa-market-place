
import { 
  Car, 
  Smartphone,
  Sofa,
  HomeIcon,
  Building,
  PawPrint,
  Shirt,
  Scissors,
  Briefcase,
  HandHelping,
  CalendarDays,
  Hammer,
  GraduationCap,
  Monitor,
  Headphones,
  Package
} from "lucide-react";

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: any;
  coverImage?: string;
}

export const categories: Category[] = [
  { 
    id: 1, 
    name: "Automobiles", 
    slug: "automobiles",
    icon: Car,
    coverImage: "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 2, 
    name: "Smartphone et Tablettes", 
    slug: "smartphone-tablettes",
    icon: Smartphone,
    coverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 3, 
    name: "Meubles", 
    slug: "meubles",
    icon: Sofa,
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 4, 
    name: "Électroménagers", 
    slug: "electromenagers",
    icon: HomeIcon,
    coverImage: "https://images.unsplash.com/photo-1609951651467-713256d1a3be?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 5, 
    name: "Immobilier", 
    slug: "immobilier",
    icon: Building,
    coverImage: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 6, 
    name: "Animaux", 
    slug: "animaux",
    icon: PawPrint,
    coverImage: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 7, 
    name: "Mode", 
    slug: "mode",
    icon: Shirt,
    coverImage: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 8, 
    name: "Beauté et Bien-être", 
    slug: "beaute-bien-etre",
    icon: Scissors,
    coverImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 9, 
    name: "Emplois", 
    slug: "emplois",
    icon: Briefcase,
    coverImage: "https://images.unsplash.com/photo-1661956602139-ec64991b8b16?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 10, 
    name: "Services", 
    slug: "services",
    icon: HandHelping,
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 11, 
    name: "Événementiels", 
    slug: "evenementiels",
    icon: CalendarDays,
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 12, 
    name: "Artisanat", 
    slug: "artisanat",
    icon: Hammer,
    coverImage: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 13, 
    name: "Formations", 
    slug: "formations",
    icon: GraduationCap,
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 14, 
    name: "Informatique", 
    slug: "informatique",
    icon: Monitor,
    coverImage: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 15, 
    name: "Gadgets high-tech", 
    slug: "gadgets-high-tech",
    icon: Headphones,
    coverImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=120&fit=crop&auto=format&q=75",
  },
  { 
    id: 16, 
    name: "Divers", 
    slug: "divers",
    icon: Package,
    coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=120&fit=crop&auto=format&q=75",
  },
];

export const regions = [
  { id: 0, name: 'Tout le Cameroun', slug: 'all' },
  { id: 1, name: 'Littoral', slug: 'littoral' },
  { id: 2, name: 'Centre', slug: 'centre' },
  { id: 3, name: 'Ouest', slug: 'ouest' },
  { id: 4, name: 'Sud-Ouest', slug: 'sud-ouest' },
  { id: 5, name: 'Nord-Ouest', slug: 'nord-ouest' },
  { id: 6, name: 'Est', slug: 'est' },
  { id: 7, name: 'Adamaoua', slug: 'adamaoua' },
  { id: 8, name: 'Nord', slug: 'nord' },
  { id: 9, name: 'Extrême-Nord', slug: 'extreme-nord' },
  { id: 10, name: 'Sud', slug: 'sud' },
];
