
import { categories } from "@/data/categoriesData";

/**
 * Service pour mapper les slugs de catégories aux valeurs de la base de données
 */

// Mapping des slugs vers les valeurs de la base de données
const CATEGORY_SLUG_TO_DB_MAPPING: { [key: string]: string } = {
  'electronique': 'Électronique',
  'vehicules': 'Véhicules', 
  'immobilier': 'Immobilier',
  'vetements': 'Vêtements',
  'services': 'Services',
  'emploi': 'Emploi',
  'maison-jardin': 'Maison & Jardin',
  'sport-loisirs': 'Sport & Loisirs',
  'animaux': 'Animaux',
  'enfants': 'Enfants',
  'musique': 'Musique',
  'livres': 'Livres'
};

/**
 * Convertit un slug de catégorie en valeur de base de données
 */
export const getCategoryDbValue = (slug: string): string => {
  return CATEGORY_SLUG_TO_DB_MAPPING[slug] || slug;
};

/**
 * Convertit une valeur de base de données en slug de catégorie
 */
export const getCategorySlug = (dbValue: string): string => {
  const entry = Object.entries(CATEGORY_SLUG_TO_DB_MAPPING).find(
    ([slug, value]) => value === dbValue
  );
  return entry ? entry[0] : dbValue.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Obtient toutes les catégories avec leur mapping
 */
export const getAllCategoryMappings = () => {
  return categories.map(category => ({
    ...category,
    dbValue: getCategoryDbValue(category.slug)
  }));
};
