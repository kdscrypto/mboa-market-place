
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
  GraduationCap
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
    coverImage: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 2, 
    name: "Smartphone et Tablettes", 
    slug: "smartphone-tablettes",
    icon: Smartphone,
    coverImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 3, 
    name: "Meubles", 
    slug: "meubles",
    icon: Sofa,
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 4, 
    name: "Électroménagers", 
    slug: "electromenagers",
    icon: HomeIcon,
    coverImage: "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 5, 
    name: "Immobilier", 
    slug: "immobilier",
    icon: Building,
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 6, 
    name: "Animaux", 
    slug: "animaux",
    icon: PawPrint,
    coverImage: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 7, 
    name: "Mode", 
    slug: "mode",
    icon: Shirt,
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 8, 
    name: "Beauté et Bien-être", 
    slug: "beaute-bien-etre",
    icon: Scissors,
    coverImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 9, 
    name: "Emplois", 
    slug: "emplois",
    icon: Briefcase,
    coverImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 10, 
    name: "Services", 
    slug: "services",
    icon: HandHelping,
    coverImage: "https://images.unsplash.com/photo-1552664688-28f48d414de3?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 11, 
    name: "Événementiels", 
    slug: "evenementiels",
    icon: CalendarDays,
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 12, 
    name: "Artisanat", 
    slug: "artisanat",
    icon: Hammer,
    coverImage: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1200&auto=format&fit=crop",
  },
  { 
    id: 13, 
    name: "Formations", 
    slug: "formations",
    icon: GraduationCap,
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
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
