// PHASE 3: Enhanced ad container with optimized loading states and error handling
import React from 'react';
import { useAdsterraLazy } from '@/hooks/useAdsterraLazy';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LazyAdContainerProps {
  zoneKeyOrId: string;
  adType?: 'banner' | 'native' | 'social';
  className?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  showDebugInfo?: boolean;
  fallbackContent?: React.ReactNode;
  style?: React.CSSProperties;
}

const LazyAdContainer: React.FC<LazyAdContainerProps> = ({
  zoneKeyOrId,
  adType = 'banner',
  className,
  showLoadingState = true,
  showErrorState = true,
  showDebugInfo = false,
  fallbackContent,
  style
}) => {
  const { adRef, state, zoneConfig, retryLoad } = useAdsterraLazy(zoneKeyOrId, adType);

  // Get performance metrics
  const getLoadTime = () => {
    if (state.loadStartTime && state.loadEndTime) {
      return Math.round(state.loadEndTime - state.loadStartTime);
    }
    return null;
  };

  // Render loading state
  const renderLoadingState = () => {
    if (!showLoadingState || !state.isLoading) return null;

    return (
      <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement de la publicité...</span>
          {zoneConfig?.isProduction && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              PROD
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render error state
  const renderErrorState = () => {
    if (!showErrorState || !state.hasError) return null;

    return (
      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-destructive">
              Erreur de chargement publicitaire
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Zone: {zoneKeyOrId} | Tentatives: {state.retryCount}
            </p>
            {!zoneConfig?.isProduction && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Zone de test - remplacer par une vraie zone Adsterra
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={retryLoad}
              className="mt-2 h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Render debug info
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    const loadTime = getLoadTime();

    return (
      <div className="text-xs text-muted-foreground bg-muted/10 p-2 rounded border">
        <div className="grid grid-cols-2 gap-2">
          <div>Zone: {zoneConfig?.id || 'Unknown'}</div>
          <div>Type: {zoneConfig?.type || adType}</div>
          <div>Visible: {state.isVisible ? '✅' : '❌'}</div>
          <div>Loaded: {state.isLoaded ? '✅' : '❌'}</div>
          <div>Content: {state.hasContent ? '✅' : '❌'}</div>
          <div>Error: {state.hasError ? '❌' : '✅'}</div>
          {loadTime && <div>Load time: {loadTime}ms</div>}
          <div>Production: {zoneConfig?.isProduction ? '✅' : '❌'}</div>
        </div>
      </div>
    );
  };

  // Render visibility indicator (for debugging)
  const renderVisibilityIndicator = () => {
    if (!showDebugInfo || !state.isVisible) return null;

    return (
      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full opacity-70">
        <Eye className="h-3 w-3" />
      </div>
    );
  };

  // Render fallback content
  const renderFallbackContent = () => {
    if (!fallbackContent || state.isLoading || state.hasContent) return null;

    return (
      <div className="p-4 bg-muted/10 rounded-lg border border-dashed">
        {fallbackContent}
      </div>
    );
  };

  // Show skeleton while not visible (for better UX)
  const renderSkeleton = () => {
    if (state.isVisible || state.hasContent) return null;

    const height = zoneConfig?.dimensions?.height || 250;

    return (
      <div 
        className="bg-muted/20 rounded-lg animate-pulse"
        style={{ height: `${height}px` }}
      />
    );
  };

  return (
    <div className={cn("relative", className)} style={style}>
      {/* Visibility indicator for debugging */}
      {renderVisibilityIndicator()}
      
      {/* Main ad container */}
      <div
        ref={adRef}
        className={cn(
          "transition-opacity duration-300",
          state.hasContent ? "opacity-100" : "opacity-0"
        )}
        data-testid={`ad-container-${zoneKeyOrId}`}
      />

      {/* Loading state */}
      {renderLoadingState()}

      {/* Error state */}
      {renderErrorState()}

      {/* Skeleton loader */}
      {renderSkeleton()}

      {/* Fallback content */}
      {renderFallbackContent()}

      {/* Debug information */}
      {renderDebugInfo()}

      {/* Production indicator */}
      {zoneConfig?.isProduction && showDebugInfo && (
        <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br">
          PRODUCTION
        </div>
      )}
    </div>
  );
};

export default LazyAdContainer;