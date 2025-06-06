
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdContainerProps {
  children: React.ReactNode;
  className?: string;
  onImpression?: () => void;
  lazy?: boolean;
}

const AdContainer: React.FC<AdContainerProps> = ({
  children,
  className,
  onImpression,
  lazy = true
}) => {
  const [isVisible, setIsVisible] = useState(!lazy);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Track impression when ad becomes visible
          if (!hasTrackedImpression && onImpression) {
            onImpression();
            setHasTrackedImpression(true);
          }
          
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazy, onImpression, hasTrackedImpression]);

  // Track impression for non-lazy ads
  useEffect(() => {
    if (!lazy && !hasTrackedImpression && onImpression) {
      onImpression();
      setHasTrackedImpression(true);
    }
  }, [lazy, hasTrackedImpression, onImpression]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "ad-container transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      role="banner"
      aria-label="Advertisement"
    >
      {isVisible && children}
    </div>
  );
};

export default AdContainer;
