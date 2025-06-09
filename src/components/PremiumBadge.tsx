import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  className?: string;
}

// Updated Premium badge - all ads are now free but we keep the visual distinction
const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className }) => {
  return (
    <Badge 
      className={cn(
        "bg-mboa-orange text-white gap-1 font-medium py-1", 
        className
      )}
    >
      <Star className="h-3 w-3" /> Mis en avant
    </Badge>
  );
};

export default PremiumBadge;
