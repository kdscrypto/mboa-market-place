
import { categories } from "@/data/categoriesData";

/**
 * Service pour mapper les slugs de catégories aux valeurs de la base de données
 */

// Mapping des slugs vers les valeurs de la base de données basé sur categoriesData.ts
const CATEGORY_SLUG_TO_DB_MAPPING: { [key: string]: string } = {
  'automobiles': 'Automobiles',
  'smartphone-tablettes': 'Smartphone et Tablettes', 
  'meubles': 'Meubles',
  'electromenagers': 'Électroménagers',
  'immobilier': 'Immobilier',
  'animaux': 'Animaux',
  'mode': 'Mode',
  'beaute-bien-etre': 'Beauté et Bien-être',
  'emplois': 'Emplois',
  'services': 'Services',
  'evenementiels': 'Événementiels',
  'artisanat': 'Artisanat',
  'formations': 'Formations'
};

/**
 * Convertit un slug de catégorie en valeur de base de données
 */
export const getCategoryDbValue = (slug: string): string => {
  const dbValue = CATEGORY_SLUG_TO_DB_MAPPING[slug];
  console.log("Category mapping:", { slug, dbValue, available: Object.keys(CATEGORY_SLUG_TO_DB_MAPPING) });
  return dbValue || slug;
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
