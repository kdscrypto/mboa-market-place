
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
        "mboa-card flex flex-col items-center justify-center p-4 text-center gap-2 transition-all hover:shadow-md",
        "relative overflow-hidden h-32",
        className
      )}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="absolute inset-0 w-full h-full z-0 opacity-20">
          <img 
            src={coverImage} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center">
        {Icon ? (
          <div className="w-12 h-12 rounded-full bg-mboa-orange/10 flex items-center justify-center">
            <Icon className="text-mboa-orange w-6 h-6" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-mboa-orange/10 flex items-center justify-center">
            <i className="text-mboa-orange"></i>
          </div>
        )}
        <span className="font-medium mt-2">{name}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
