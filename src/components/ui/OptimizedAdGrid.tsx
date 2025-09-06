import React, { memo, useMemo } from 'react';
import { VirtualList } from '@/components/ui/VirtualList';
import AdCard from '@/components/AdCard';
import { useOptimizedCallback } from '@/hooks/usePerformanceHooks';

interface OptimizedAdGridProps {
  ads: any[];
  loading?: boolean;
  className?: string;
}

const OptimizedAdGrid = memo(({ ads, loading, className }: OptimizedAdGridProps) => {
  // Memoize the filtered and sorted ads
  const processedAds = useMemo(() => {
    return ads.filter(ad => ad && ad.id).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [ads]);

  // Optimized item renderer for virtual list
  const renderAdItem = useOptimizedCallback(({ index, style, data }: any) => (
    <div style={style} className="p-2">
      <AdCard 
        id={data[index].id}
        title={data[index].title}
        price={data[index].price}
        location={{ city: data[index].city, region: data[index].region }}
        imageUrl={data[index].imageUrl || '/placeholder.svg'}
        createdAt={new Date(data[index].created_at)}
      />
    </div>
  ), []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (processedAds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune annonce trouvée</p>
      </div>
    );
  }

  // Use virtual list for large datasets (>50 items)
  if (processedAds.length > 50) {
    return (
      <div className={className}>
        <VirtualList
          items={processedAds}
          height={600}
          itemHeight={350}
          renderItem={renderAdItem}
          className="w-full"
        />
      </div>
    );
  }

  // Regular grid for smaller datasets
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {processedAds.map((ad) => (
        <AdCard 
          key={ad.id} 
          id={ad.id}
          title={ad.title}
          price={ad.price}
          location={{ city: ad.city, region: ad.region }}
          imageUrl={ad.imageUrl || '/placeholder.svg'}
          createdAt={new Date(ad.created_at)}
        />
      ))}
    </div>
  );
});

OptimizedAdGrid.displayName = 'OptimizedAdGrid';

export default OptimizedAdGrid;