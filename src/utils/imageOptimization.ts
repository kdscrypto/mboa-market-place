/**
 * Image optimization utilities for better performance and SEO
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

/**
 * Optimizes Supabase Storage image URLs with transformation parameters
 */
export function optimizeSupabaseImage(
  url: string, 
  options: ImageOptimizationOptions = {}
): string {
  // Vérifier si c'est une URL Supabase valide
  if (!url || !url.includes('supabase.co/storage/v1/object/public')) {
    return url;
  }

  const {
    width = 350,
    height = 350,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    // Extraire le bucket et le chemin de l'URL
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return url;

    const [baseUrl, bucketAndPath] = urlParts;
    
    // Utiliser la transformation d'image intégrée de Supabase
    const transformationUrl = `${baseUrl}/storage/v1/render/image/public/${bucketAndPath}?width=${width}&height=${height}&quality=${quality}&format=${format}&resize=cover`;
    
    return transformationUrl;
  } catch (error) {
    console.error('Error optimizing Supabase image:', error);
    return url; // Return original URL on error
  }
}

/**
 * Optimizes external image URLs (like Unsplash) with appropriate parameters
 */
export function optimizeExternalImage(
  url: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) return url;

  // Handle Unsplash images
  if (url.includes('images.unsplash.com')) {
    const { width = 350, height = 350, quality = 75 } = options;
    
    // Remove existing query parameters to avoid conflicts
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=${quality}`;
  }

  return url;
}

/**
 * Smart image optimization that detects the image source and applies appropriate optimizations
 */
export function optimizeImage(
  url: string | undefined,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '/placeholder.svg';
  }

  const trimmedUrl = url.trim();

  // Rejeter les URLs placeholder locales
  if (trimmedUrl.includes('placeholder') && trimmedUrl.startsWith('/')) {
    return '/placeholder.svg';
  }

  // Optimiser les images Supabase
  if (trimmedUrl.includes('supabase.co/storage/v1/object/public')) {
    return optimizeSupabaseImage(trimmedUrl, options);
  }

  // Optimiser les images Unsplash
  if (trimmedUrl.includes('images.unsplash.com')) {
    return optimizeExternalImage(trimmedUrl, options);
  }

  // Retourner l'URL originale pour les autres cas
  return trimmedUrl;
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveImageSizes(baseUrl: string): {
  small: string;
  medium: string;
  large: string;
} {
  return {
    small: optimizeImage(baseUrl, { width: 200, height: 200, quality: 75 }),
    medium: optimizeImage(baseUrl, { width: 350, height: 350, quality: 80 }),
    large: optimizeImage(baseUrl, { width: 600, height: 450, quality: 85 }),
  };
}