
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className }) => {
  return (
    <Badge 
      className={cn(
        "bg-mboa-orange text-white gap-1 font-medium py-1", 
        className
      )}
    >
      <Flame className="h-3 w-3" /> Premium
    </Badge>
  );
};

export default PremiumBadge;
