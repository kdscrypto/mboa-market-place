import React, { useMemo, useCallback } from 'react';
import { scheduleTask } from '@/utils/scheduler';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

// Simple virtualized list implementation for handling large datasets efficiently
export const VirtualList = <T,>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  onScroll,
  className = '' 
}: VirtualListProps<T>) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => items, [items]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(height / itemHeight) + 2; // Add buffer
    return Math.min(visibleCount, items.length);
  }, [height, itemHeight, items.length]);

  // Optimized scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (onScroll) {
      // Schedule scroll handler as low priority to avoid blocking
      scheduleTask(() => onScroll(scrollTop), 'low');
    }
  }, [onScroll]);

  // Render visible items
  const renderItems = useMemo(() => {
    return items.slice(0, visibleItems).map((item, index) => (
      <div key={index} style={{ height: itemHeight }}>
        {renderItem({ index, style: { height: itemHeight }, data: item })}
      </div>
    ));
  }, [items, visibleItems, itemHeight, renderItem]);

  return (
    <div 
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight }}>
        {renderItems}
      </div>
    </div>
  );
};

export default React.memo(VirtualList);