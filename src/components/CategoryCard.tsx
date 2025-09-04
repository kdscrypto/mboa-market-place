
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: React.ComponentType<any>;
  coverImage?: string;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  slug,
  icon: Icon,
  coverImage,
  className
}) => {
  return (
    <Link 
      to={`/categorie/${slug}`}
      className={cn(
        "mboa-card flex flex-col items-center justify-end p-4 text-center gap-2 transition-all hover:shadow-md",
        "relative overflow-hidden h-40 rounded-lg",
        className
      )}
    >
      {/* Cover Image with better visibility */}
      {coverImage && (
        <div className="absolute inset-0 w-full h-full z-0">
          <img 
            src={coverImage} 
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center">
        <span className="font-medium text-white text-lg mb-1">{name}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
            <Icon className="text-white w-4 h-4" />
          </div>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
