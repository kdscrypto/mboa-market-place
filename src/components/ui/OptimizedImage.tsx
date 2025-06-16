
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useEnhancedLazyLoading } from '@/hooks/useEnhancedLazyLoading';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = '/placeholder.svg',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { elementRef, isIntersecting } = useEnhancedLazyLoading<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  });

  const shouldLoad = priority || isIntersecting;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate optimized src with cache busting for Supabase URLs
  const getOptimizedSrc = (originalSrc: string): string => {
    if (hasError) return placeholder;
    
    if (originalSrc.includes('supabase.co/storage/v1/object/public')) {
      const url = new URL(originalSrc);
      // Add width and height parameters for optimization
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      // Add quality optimization
      url.searchParams.set('quality', '80');
      // Add modern format support
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return originalSrc;
  };

  return (
    <div 
      ref={elementRef} 
      className={cn("relative overflow-hidden", className)}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {/* Loading placeholder with skeleton animation */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 skeleton flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>
      )}
      
      {/* Actual image */}
      {shouldLoad && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            hasError && "hidden"
          )}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: 'cover'
          }}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <img
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          className="opacity-50"
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
