
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLink?: string;
  actionText?: string;
  isPremium?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  actionLink, 
  actionText,
  isPremium = false
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-500">{message}</p>
        {actionLink && actionText && (
          <Button 
            asChild 
            variant={isPremium ? "default" : "outline"}
            className={isPremium ? "mt-4 bg-mboa-orange hover:bg-mboa-orange/90" : "mt-4"}
          >
            <Link to={actionLink}>
              {actionText}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
};

export default EmptyState;
