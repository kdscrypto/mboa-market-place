
import React, { useEffect, useState } from 'react';

interface DebugInfo {
  timestamp: string;
  userAgent: string;
  viewport: { width: number; height: number };
  isMobileDevice: boolean;
  touchSupport: boolean;
  errors: string[];
  renderSteps: string[];
  cssLoaded: boolean;
  jsLoaded: boolean;
  supabaseConnected: boolean;
}

const MobileDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    timestamp: new Date().toISOString(),
    userAgent: '',
    viewport: { width: 0, height: 0 },
    isMobileDevice: false,
    touchSupport: false,
    errors: [],
    renderSteps: [],
    cssLoaded: false,
    jsLoaded: true,
    supabaseConnected: false
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("=== MOBILE DEBUGGER INITIALIZING ===");
    
    const updateDebugInfo = () => {
      const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        isMobileDevice: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        touchSupport: 'ontouchstart' in window,
        errors: [],
        renderSteps: ['Debugger initialized'],
        cssLoaded: document.styleSheets.length > 0,
        jsLoaded: true,
        supabaseConnected: false
      };

      setDebugInfo(info);
      console.log("Mobile Debug Info:", info);
      
      return info;
    };

    const currentInfo = updateDebugInfo();

    // Capture errors
    const errorHandler = (event: ErrorEvent) => {
      console.error("Captured error:", event.error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `${event.error?.message || event.message} at ${event.filename}:${event.lineno}`]
      }));
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Promise rejection: ${event.reason}`]
      }));
    };

    // Écouter l'événement d'ouverture depuis UltraBasicMobileDebug
    const openAdvancedDebugHandler = (event: CustomEvent) => {
      console.log("Advanced debug requested from:", event.detail);
      setIsVisible(true);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    window.addEventListener('resize', updateDebugInfo);
    window.addEventListener('openAdvancedDebug', openAdvancedDebugHandler as EventListener);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      window.removeEventListener('resize', updateDebugInfo);
      window.removeEventListener('openAdvancedDebug', openAdvancedDebugHandler as EventListener);
    };
  }, []);

  // Triple tap handling - simplifié
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    const handleTripleTap = (e: Event) => {
      console.log("Tap detected, count:", tapCount + 1);
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 2000);
      } else if (tapCount === 3) {
        clearTimeout(tapTimer);
        tapCount = 0;
        console.log("Triple tap detected! Toggling debug panel");
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('touchstart', handleTripleTap);
    document.addEventListener('click', handleTripleTap);

    return () => {
      document.removeEventListener('touchstart', handleTripleTap);
      document.removeEventListener('click', handleTripleTap);
      if (tapTimer) clearTimeout(tapTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div 
        className="fixed top-0 right-0 w-8 h-8 opacity-80 z-[9999] cursor-pointer"
        onClick={() => setIsVisible(true)}
        data-mobile-debugger="true"
        data-advanced-debug="true"
        style={{ 
          background: debugInfo.errors.length > 0 ? '#ef4444' : '#3b82f6',
          borderRadius: '0 0 0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: 'white',
          fontWeight: 'bold',
          marginTop: '30px', // Éviter la superposition avec la barre debug
        }}
        title="Debug avancé"
      >
        🔧
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[9998] overflow-auto" data-advanced-debug="open">
      <div className="bg-white m-2 p-3 rounded-lg text-xs font-mono max-h-[95vh] overflow-y-auto" style={{ marginTop: '35px' }}>
        <div className="flex justify-between items-center mb-3 sticky top-0 bg-white pb-2 border-b">
          <h3 className="font-bold text-sm text-blue-600">🔧 Debug Avancé</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log("=== DIAGNOSTIC REACT APPROFONDI ===");
                // Forcer un re-render de React
                const rootElement = document.getElementById('root');
                if (rootElement && (window as any).React) {
                  console.log("Tentative de récupération React...");
                  try {
                    // Essayer de récupérer les erreurs React
                    const reactFiber = (rootElement as any)._reactInternalFiber || (rootElement as any)._reactInternalInstance;
                    console.log("React Fiber found:", !!reactFiber);
                  } catch (e) {
                    console.log("React Fiber analysis failed:", e);
                  }
                }
              }}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
            >
              🩺 Diag React
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
            >
              🔄 Reload
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Device Info */}
          <div className="border p-2 rounded bg-green-50">
            <h4 className="font-semibold mb-1 text-green-600 text-xs">📱 Device</h4>
            <div className="text-[10px]">Viewport: {debugInfo.viewport.width}x{debugInfo.viewport.height}</div>
            <div className="text-[10px]">Mobile: {debugInfo.isMobileDevice ? '✅' : '❌'}</div>
            <div className="text-[10px]">Touch: {debugInfo.touchSupport ? '✅' : '❌'}</div>
          </div>

          {/* System Status */}
          <div className="border p-2 rounded bg-blue-50">
            <h4 className="font-semibold mb-1 text-blue-600 text-xs">⚙️ System</h4>
            <div className="text-[10px]">CSS: {debugInfo.cssLoaded ? '✅' : '❌'}</div>
            <div className="text-[10px]">JavaScript: {debugInfo.jsLoaded ? '✅' : '❌'}</div>
            <div className="text-[10px]">React: {(window as any).React ? '✅' : '❌'}</div>
          </div>

          {/* DOM Analysis */}
          <div className="border p-2 rounded bg-purple-50">
            <h4 className="font-semibold mb-1 text-purple-600 text-xs">🏗️ DOM</h4>
            <div className="text-[10px]">React Root: {document.getElementById('root') ? '✅' : '❌'}</div>
            <div className="text-[10px]">Root Children: {document.getElementById('root')?.children.length || 0}</div>
            <div className="text-[10px]">Main App: {document.querySelector('[data-main-app]') ? '✅' : '❌'}</div>
            <div className="text-[10px]">Header: {document.querySelector('header') ? '✅' : '❌'}</div>
            <div className="text-[10px]">Main: {document.querySelector('main') ? '✅' : '❌'}</div>
            <div className="text-[10px]">Total Elements: {document.body.children.length}</div>
          </div>

          {/* React Analysis */}
          <div className="border p-2 rounded bg-yellow-50">
            <h4 className="font-semibold mb-1 text-yellow-600 text-xs">⚛️ React</h4>
            <div className="text-[10px]">Version: {(window as any).React?.version || 'Non détectée'}</div>
            <div className="text-[10px]">DevTools: {(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ ? '✅' : '❌'}</div>
            <div className="text-[10px]">Root Mount: {(() => {
              const rootElement = document.getElementById('root');
              if (!rootElement) return '❌';
              // Safely check for React internal properties
              const hasReactInstance = (rootElement as any)._reactInternalInstance || (rootElement as any)._reactInternalFiber;
              return hasReactInstance ? '✅' : '❌';
            })()}</div>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="border p-2 rounded border-red-300 bg-red-50">
              <h4 className="font-semibold mb-1 text-red-600 text-xs">🚨 Errors</h4>
              <div className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-red-600 bg-red-100 p-1 rounded text-[9px]">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border p-2 rounded bg-gray-50">
            <h4 className="font-semibold mb-1 text-orange-600 text-xs">⚡ Actions</h4>
            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-[10px]"
              >
                🔄 Reload
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 text-[10px]"
              >
                🗑️ Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugger;
