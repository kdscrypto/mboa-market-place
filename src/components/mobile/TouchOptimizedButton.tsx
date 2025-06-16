
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TouchOptimizedButtonProps extends React.ComponentProps<typeof Button> {
  touchSize?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  touchSize = 'md',
  className,
  children,
  ...props
}) => {
  const touchSizeClasses = {
    sm: 'min-h-[40px] min-w-[40px] px-3 py-2',
    md: 'min-h-[44px] min-w-[44px] px-4 py-2.5',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-3'
  };

  return (
    <Button
      className={cn(
        'touch-manipulation',
        'active:scale-95 transition-transform duration-150',
        touchSizeClasses[touchSize],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchOptimizedButton;
