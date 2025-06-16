
import React, { useEffect, useState } from 'react';
import { useAdvancedMobileDetection } from '@/hooks/useAdvancedMobileDetection';
import { useMobileUserPreferences } from '@/hooks/useMobileUserPreferences';
import { useMobileAnalytics } from '@/hooks/useMobileAnalytics';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Settings, 
  Eye, 
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react';

interface MobileContextualUIProps {
  children: React.ReactNode;
}

const MobileContextualUI: React.FC<MobileContextualUIProps> = ({ children }) => {
  const { deviceType, performanceLevel, connectionType, orientation, screenSize } = useAdvancedMobileDetection();
  const { preferences, updatePreference, getOptimalSettings } = useMobileUserPreferences();
  const { analytics, getInsights } = useMobileAnalytics();
  
  const [showOptimizationSuggestion, setShowOptimizationSuggestion] = useState(false);
  const [contextualActions, setContextualActions] = useState<string[]>([]);

  const insights = getInsights();

  // Generate contextual actions based on current state
  useEffect(() => {
    const actions: string[] = [];

    // Performance-based suggestions
    if (performanceLevel === 'low') {
      actions.push('enable-performance-mode');
    }

    // Connection-based suggestions
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      actions.push('enable-data-saver');
    }

    // Engagement-based suggestions
    if (insights.engagement === 'low') {
      actions.push('improve-experience');
    }

    // Device-specific suggestions
    if (deviceType === 'mobile' && orientation === 'landscape') {
      actions.push('optimize-landscape');
    }

    setContextualActions(actions);
  }, [performanceLevel, connectionType, insights.engagement, deviceType, orientation]);

  // Show optimization suggestion if needed
  useEffect(() => {
    const shouldShow = contextualActions.length > 0 && 
                     analytics.userBehavior.timeOnPage > 10000 && 
                     !localStorage.getItem('optimization_dismissed');
    
    setShowOptimizationSuggestion(shouldShow);
  }, [contextualActions, analytics.userBehavior.timeOnPage]);

  const applyOptimalSettings = () => {
    const optimal = getOptimalSettings();
    Object.entries(optimal).forEach(([key, value]) => {
      updatePreference(key as keyof typeof optimal, value);
    });
    setShowOptimizationSuggestion(false);
    localStorage.setItem('optimization_dismissed', 'true');
  };

  const dismissSuggestion = () => {
    setShowOptimizationSuggestion(false);
    localStorage.setItem('optimization_dismissed', 'true');
  };

  const getContextualMessage = () => {
    if (performanceLevel === 'low' && connectionType === 'slow-2g') {
      return "Votre appareil et connexion semblent lents. Activez le mode performance pour une meilleure expérience.";
    }
    
    if (performanceLevel === 'low') {
      return "Activez le mode performance pour une navigation plus fluide sur votre appareil.";
    }
    
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return "Connexion lente détectée. Le mode économie de données peut améliorer votre expérience.";
    }
    
    if (insights.engagement === 'low') {
      return "Personnalisez votre expérience pour une navigation plus agréable.";
    }
    
    return "Optimisez votre expérience mobile avec nos recommandations.";
  };

  return (
    <>
      {children}
      
      {/* Contextual Optimization Suggestion */}
      {showOptimizationSuggestion && (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden">
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Optimisation suggérée
                  </h4>
                  <p className="text-xs text-blue-800 mb-3">
                    {getContextualMessage()}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={applyOptimalSettings}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Optimiser
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={dismissSuggestion}
                      className="text-blue-600 border-blue-300"
                    >
                      Ignorer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Status Indicator (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 md:hidden">
          <Card className="bg-black/80 text-white backdrop-blur">
            <CardContent className="p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-3 w-3" />
                  <span>{deviceType} - {orientation}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-3 w-3" />
                  <span>Performance: {performanceLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-3 w-3" />
                  <span>Connexion: {connectionType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Engagement: {insights.engagement}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 w-3" />
                  <span>FPS: {analytics.performance.fps}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileContextualUI;
