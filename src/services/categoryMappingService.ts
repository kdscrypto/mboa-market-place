
import { categories } from "@/data/categoriesData";

/**
 * Service pour mapper les slugs de catégories aux valeurs de la base de données
 */

/**
 * Convertit un slug de catégorie en valeur de base de données (ID numérique)
 */
export const getCategoryDbValue = (slug: string): string => {
  const category = categories.find(cat => cat.slug === slug);
  const dbValue = category ? category.id.toString() : slug;
  console.log("Category slug to DB mapping:", { 
    slug, 
    foundCategory: !!category, 
    dbValue, 
    categoryName: category?.name 
  });
  return dbValue;
};

/**
 * Convertit une valeur de base de données en slug de catégorie
 */
export const getCategorySlug = (dbValue: string): string => {
  const numericId = parseInt(dbValue);
  const category = categories.find(cat => cat.id === numericId);
  const slug = category ? category.slug : dbValue.toLowerCase().replace(/\s+/g, '-');
  console.log("Category DB to slug mapping:", { 
    dbValue, 
    numericId, 
    foundCategory: !!category, 
    slug 
  });
  return slug;
};

/**
 * Obtient le nom d'affichage d'une catégorie à partir de sa valeur en base
 */
export const getCategoryDisplayName = (dbValue: string): string => {
  const numericId = parseInt(dbValue);
  const category = categories.find(cat => cat.id === numericId);
  return category ? category.name : `Catégorie ${dbValue}`;
};

/**
 * Obtient toutes les catégories avec leur mapping
 */
export const getAllCategoryMappings = () => {
  return categories.map(category => ({
    ...category,
    dbValue: category.id.toString()
  }));
};

/**
 * Obtient l'ID numérique d'une catégorie à partir de son slug
 */
export const getCategoryIdFromSlug = (slug: string): number | null => {
  const category = categories.find(cat => cat.slug === slug);
  return category ? category.id : null;
};
