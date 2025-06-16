
import { useCallback, useRef, useState } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface TouchGestureOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipe,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300
  } = options;

  const startTouch = useRef<TouchPoint | null>(null);
  const lastTap = useRef<TouchPoint | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const initialPinchDistance = useRef<number>(0);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getSwipeDirection = (start: TouchPoint, end: TouchPoint): 'left' | 'right' | 'up' | 'down' => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    if (e.touches.length === 1) {
      startTouch.current = point;
      
      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress(point);
        }, longPressDelay);
      }
    } else if (e.touches.length === 2 && onPinch) {
      // Start pinch gesture
      setIsPinching(true);
      initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [onLongPress, onPinch, longPressDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (e.touches.length === 2 && isPinching && onPinch) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialPinchDistance.current;
      onPinch(scale);
    }
  }, [isPinching, onPinch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isPinching) {
      setIsPinching(false);
      return;
    }

    if (!startTouch.current || e.changedTouches.length === 0) return;

    const endTouch = e.changedTouches[0];
    const endPoint: TouchPoint = {
      x: endTouch.clientX,
      y: endTouch.clientY,
      timestamp: Date.now()
    };

    const dx = endPoint.x - startTouch.current.x;
    const dy = endPoint.y - startTouch.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = endPoint.timestamp - startTouch.current.timestamp;

    // Check for swipe gesture
    if (distance >= swipeThreshold && onSwipe) {
      const direction = getSwipeDirection(startTouch.current, endPoint);
      const velocity = distance / duration;
      
      onSwipe({
        direction,
        distance,
        velocity,
        duration
      });
    } else if (distance < 10 && duration < 200) {
      // Check for tap or double tap
      if (lastTap.current && 
          endPoint.timestamp - lastTap.current.timestamp < doubleTapDelay &&
          Math.abs(endPoint.x - lastTap.current.x) < 50 &&
          Math.abs(endPoint.y - lastTap.current.y) < 50) {
        // Double tap
        if (onDoubleTap) {
          onDoubleTap(endPoint);
        }
        lastTap.current = null;
      } else {
        // Single tap
        if (onTap) {
          setTimeout(() => {
            if (lastTap.current === endPoint) {
              onTap(endPoint);
            }
          }, doubleTapDelay);
        }
        lastTap.current = endPoint;
      }
    }

    startTouch.current = null;
  }, [isPinching, swipeThreshold, onSwipe, onTap, onDoubleTap, doubleTapDelay]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};
