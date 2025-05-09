
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  slug: string;
  iconClass?: string;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  slug,
  iconClass,
  className
}) => {
  return (
    <Link 
      to={`/categorie/${slug}`}
      className={cn(
        "mboa-card flex flex-col items-center justify-center p-4 text-center gap-2",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-mboa-orange/10 flex items-center justify-center">
        <i className={cn("text-mboa-orange", iconClass)}></i>
      </div>
      <span className="font-medium">{name}</span>
    </Link>
  );
};

export default CategoryCard;
