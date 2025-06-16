
import React from 'react';
import { cn } from '@/lib/utils';
import { useAdvancedMobileDetection } from '@/hooks/useAdvancedMobileDetection';

interface MobileAdaptiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: number;
  maxColumns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
}

const MobileAdaptiveGrid: React.FC<MobileAdaptiveGridProps> = ({
  children,
  className,
  minItemWidth = 280,
  maxColumns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'md',
  aspectRatio = 'auto'
}) => {
  const { deviceType, screenSize, performanceLevel } = useAdvancedMobileDetection();

  const getGridConfig = () => {
    const { width } = screenSize;
    
    // Calculate optimal columns based on screen width and device type
    let columns: number;
    
    if (deviceType === 'mobile') {
      if (width < 400) {
        columns = 1;
      } else {
        columns = Math.min(maxColumns.mobile, Math.floor(width / minItemWidth));
      }
    } else if (deviceType === 'tablet') {
      columns = Math.min(maxColumns.tablet, Math.floor(width / minItemWidth));
    } else {
      columns = Math.min(maxColumns.desktop, Math.floor(width / minItemWidth));
    }

    return Math.max(1, columns);
  };

  const columns = getGridConfig();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: ''
  };

  // Performance optimization: reduce animations on low-performance devices
  const animationClass = performanceLevel === 'low' ? '' : 'transition-all duration-200';

  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        animationClass,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        // Optimize for touch interfaces
        touchAction: 'manipulation'
      }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            'w-full',
            aspectRatioClasses[aspectRatio],
            // Add stagger effect for better perceived performance
            animationClass && `delay-[${index * 50}ms]`
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default MobileAdaptiveGrid;
