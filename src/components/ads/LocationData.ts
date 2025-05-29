
// Mock data - In a real app, these would come from Supabase
export const regions = [
  { id: 1, name: "Littoral", slug: "littoral" },
  { id: 2, name: "Centre", slug: "centre" },
  { id: 3, name: "Ouest", slug: "ouest" },
  { id: 4, name: "Sud-Ouest", slug: "sud-ouest" },
  { id: 5, name: "Nord-Ouest", slug: "nord-ouest" },
  { id: 6, name: "Est", slug: "est" },
  { id: 7, name: "Adamaoua", slug: "adamaoua" },
  { id: 8, name: "Nord", slug: "nord" },
  { id: 9, name: "Extrême-Nord", slug: "extreme-nord" },
  { id: 10, name: "Sud", slug: "sud" },
];

// Common cities in Cameroon
export const cities = {
  "littoral": ["Douala", "Edéa", "Nkongsamba"],
  "centre": ["Yaoundé", "Mbalmayo", "Obala"],
  "ouest": ["Bafoussam", "Dschang", "Bangangté"],
  "sud-ouest": ["Buea", "Limbé", "Kumba"],
  "nord-ouest": ["Bamenda", "Kumbo", "Wum"],
  "est": ["Bertoua", "Abong-Mbang", "Batouri"],
  "adamaoua": ["Ngaoundéré", "Meiganga", "Tibati"],
  "nord": ["Garoua", "Guider", "Poli"],
  "extreme-nord": ["Maroua", "Kousseri", "Mokolo"],
  "sud": ["Ebolowa", "Kribi", "Sangmélima"],
};

// UPDATED: Use the same categories as in categoriesData.ts to ensure consistency
import { categories as mainCategories } from "@/data/categoriesData";

export const categories = mainCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug
}));
