import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface AdsterraDebugPanelProps {
  className?: string;
}

interface DebugInfo {
  scriptsLoaded: string[];
  adElements: number;
  networkRequests: string[];
  lastUpdate: Date;
}

const AdsterraDebugPanel: React.FC<AdsterraDebugPanelProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    scriptsLoaded: [],
    adElements: 0,
    networkRequests: [],
    lastUpdate: new Date()
  });

  const collectDebugInfo = () => {
    const scripts = Array.from(document.querySelectorAll('script[src*="adsterra"], script[src*="revenuecpmgate"], script[src*="profitabledisplaycontent"]'))
      .map(script => (script as HTMLScriptElement).src);

    const adElements = document.querySelectorAll('.adsterra-zone, .adsterra-native-zone, .adsterra-socialbar-zone').length;

    setDebugInfo({
      scriptsLoaded: scripts,
      adElements,
      networkRequests: [], // Could be enhanced with network monitoring
      lastUpdate: new Date()
    });
  };

  useEffect(() => {
    if (isVisible) {
      collectDebugInfo();
      const interval = setInterval(collectDebugInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const getStatus = () => {
    if (debugInfo.scriptsLoaded.length > 0 && debugInfo.adElements > 0) {
      return { 
        status: 'success' as const, 
        message: 'Publicités configurées',
        icon: CheckCircle 
      };
    }
    
    if (debugInfo.scriptsLoaded.length > 0) {
      return { 
        status: 'warning' as const, 
        message: 'Scripts chargés, éléments en attente',
        icon: AlertCircle 
      };
    }
    
    return { 
      status: 'error' as const, 
      message: 'Scripts non chargés',
      icon: XCircle 
    };
  };

  const { status, message, icon: StatusIcon } = getStatus();

  if (process.env.NODE_ENV !== 'development' && window.location.hostname !== 'localhost' && !window.location.search.includes('debug=1')) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] ${className}`}>
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-black/80 text-white border-gray-600 hover:bg-black"
        >
          <StatusIcon className="h-4 w-4 mr-1" />
          Debug Ads
        </Button>
      ) : (
        <Card className="w-80 bg-black/90 text-white border-gray-600 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <StatusIcon className="h-4 w-4" />
                Debug Adsterra
              </div>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-gray-700"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 text-xs">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span>Statut:</span>
              <Badge 
                variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {message}
              </Badge>
            </div>

            {/* Scripts */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span>Scripts chargés:</span>
                <span className="text-mboa-orange">{debugInfo.scriptsLoaded.length}</span>
              </div>
              {debugInfo.scriptsLoaded.length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {debugInfo.scriptsLoaded.map((script, index) => (
                    <div key={index} className="text-green-400 text-[10px] truncate">
                      ✓ {script.split('/').pop()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-400 text-[10px]">
                  Aucun script Adsterra détecté
                </div>
              )}
            </div>

            {/* Ad Elements */}
            <div className="flex items-center justify-between">
              <span>Éléments publicitaires:</span>
              <span className="text-mboa-orange">{debugInfo.adElements}</span>
            </div>

            {/* Window Objects */}
            <div>
              <div className="mb-1">Objets globaux:</div>
              <div className="space-y-1">
                <div className={`text-[10px] ${typeof window !== 'undefined' && window.atAsyncOptions ? 'text-green-400' : 'text-red-400'}`}>
                  {typeof window !== 'undefined' && window.atAsyncOptions ? '✓' : '✗'} atAsyncOptions
                </div>
              </div>
            </div>

            {/* Last Update */}
            <div className="text-gray-400 text-[10px] pt-2 border-t border-gray-700">
              Dernière MAJ: {debugInfo.lastUpdate.toLocaleTimeString()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={collectDebugInfo}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs bg-transparent border-gray-600 hover:bg-gray-700"
              >
                Actualiser
              </Button>
              <Button
                onClick={() => console.log('Adsterra Debug Info:', debugInfo)}
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs bg-transparent border-gray-600 hover:bg-gray-700"
              >
                Console
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdsterraDebugPanel;