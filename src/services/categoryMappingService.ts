
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

// Mapping inverse : valeurs de la base de données vers les slugs
const CATEGORY_DB_TO_SLUG_MAPPING: { [key: string]: string } = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_TO_DB_MAPPING).map(([slug, dbValue]) => [dbValue, slug])
);

/**
 * Convertit un slug de catégorie en valeur de base de données
 */
export const getCategoryDbValue = (slug: string): string => {
  const dbValue = CATEGORY_SLUG_TO_DB_MAPPING[slug];
  console.log("Category slug to DB mapping:", { slug, dbValue, available: Object.keys(CATEGORY_SLUG_TO_DB_MAPPING) });
  return dbValue || slug;
};

/**
 * Convertit une valeur de base de données en slug de catégorie
 */
export const getCategorySlug = (dbValue: string): string => {
  const slug = CATEGORY_DB_TO_SLUG_MAPPING[dbValue];
  console.log("Category DB to slug mapping:", { dbValue, slug, available: Object.keys(CATEGORY_DB_TO_SLUG_MAPPING) });
  return slug || dbValue.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Obtient le nom d'affichage d'une catégorie à partir de sa valeur en base
 */
export const getCategoryDisplayName = (dbValue: string): string => {
  // La valeur en base est déjà le nom d'affichage
  return dbValue;
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
