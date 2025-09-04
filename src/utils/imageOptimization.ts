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
  if (!url || !url.includes('supabase.co/storage/v1/object/public')) {
    return url;
  }

  const {
    width = 400,
    height = 400,
    quality = 80,
    format = 'webp'
  } = options;

  // Extract the bucket and path from the URL
  const urlParts = url.split('/storage/v1/object/public/');
  if (urlParts.length !== 2) return url;

  const [baseUrl, bucketAndPath] = urlParts;
  
  // Add transformation parameters to Supabase URL
  const transformationUrl = `${baseUrl}/storage/v1/render/image/public/${bucketAndPath}?width=${width}&height=${height}&quality=${quality}&format=${format}&resize=cover`;
  
  return transformationUrl;
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
    const { width = 400, height = 400, quality = 75 } = options;
    
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

  if (url.includes('supabase.co/storage/v1/object/public')) {
    return optimizeSupabaseImage(url, options);
  }

  if (url.includes('images.unsplash.com')) {
    return optimizeExternalImage(url, options);
  }

  return url;
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
    medium: optimizeImage(baseUrl, { width: 400, height: 400, quality: 80 }),
    large: optimizeImage(baseUrl, { width: 800, height: 600, quality: 85 }),
  };
}