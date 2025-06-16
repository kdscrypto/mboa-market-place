
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

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
      // Add cache control
      url.searchParams.set('t', Date.now().toString().slice(-6));
      return url.toString();
    }
    
    return originalSrc;
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>
      )}
      
      {/* Actual image */}
      {(isInView || priority) && (
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
