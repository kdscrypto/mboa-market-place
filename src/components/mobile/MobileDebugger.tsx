
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

      // Test CSS loading
      try {
        const testElement = document.createElement('div');
        testElement.className = 'bg-red-500';
        document.body.appendChild(testElement);
        const styles = window.getComputedStyle(testElement);
        info.cssLoaded = styles.backgroundColor !== '';
        document.body.removeChild(testElement);
      } catch (error) {
        info.errors.push(`CSS test failed: ${error}`);
      }

      // Test Supabase
      try {
        // Basic check if supabase module is available
        info.supabaseConnected = typeof window !== 'undefined';
      } catch (error) {
        info.errors.push(`Supabase test failed: ${error}`);
      }

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

    // Écouter l'événement personnalisé pour forcer l'ouverture
    const handleForceOpen = () => {
      console.log("Force opening debug panel via custom event");
      setIsVisible(true);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    window.addEventListener('resize', updateDebugInfo);
    window.addEventListener('forceOpenDebugPanel', handleForceOpen);

    // Auto-show on mobile or if errors
    const timer = setTimeout(() => {
      if (currentInfo.isMobileDevice || currentInfo.errors.length > 0) {
        console.log("Auto-showing debug panel due to mobile device or errors");
        setIsVisible(true);
      }
    }, 3000); // Augmenté à 3 secondes pour laisser plus de temps

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      window.removeEventListener('resize', updateDebugInfo);
      window.removeEventListener('forceOpenDebugPanel', handleForceOpen);
      clearTimeout(timer);
    };
  }, []);

  // Triple tap handling - amélioré
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    const handleTripleTap = (e: Event) => {
      console.log("Tap detected, count:", tapCount + 1);
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          console.log("Triple tap timeout, resetting count");
          tapCount = 0;
        }, 1500); // Augmenté le délai
      } else if (tapCount === 3) {
        clearTimeout(tapTimer);
        tapCount = 0;
        console.log("Triple tap detected! Toggling debug panel");
        setIsVisible(!isVisible);
      }
    };

    // Écouter sur plusieurs types d'événements
    document.addEventListener('touchstart', handleTripleTap);
    document.addEventListener('click', handleTripleTap);
    document.addEventListener('mousedown', handleTripleTap);

    return () => {
      document.removeEventListener('touchstart', handleTripleTap);
      document.removeEventListener('click', handleTripleTap);
      document.removeEventListener('mousedown', handleTripleTap);
      if (tapTimer) clearTimeout(tapTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div 
        className="fixed top-0 right-0 w-6 h-6 opacity-70 z-[10000] cursor-pointer"
        onClick={() => setIsVisible(true)}
        data-mobile-debugger="true"
        data-advanced-debug="true"
        style={{ 
          background: debugInfo.errors.length > 0 ? '#ef4444' : '#3b82f6',
          borderRadius: '0 0 0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          fontWeight: 'bold'
        }}
        title="Cliquer pour ouvrir le debug avancé"
      >
        🔧
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[10000] overflow-auto" data-advanced-debug="open">
      <div className="bg-white m-4 p-4 rounded-lg text-xs font-mono max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
          <h3 className="font-bold text-lg text-blue-600">🔧 Mobile Debug Panel AVANCÉ</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setDebugInfo(prev => ({ ...prev, timestamp: new Date().toISOString() }));
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
            >
              🔄 Reload
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Device Info */}
          <div className="border p-3 rounded bg-green-50">
            <h4 className="font-semibold mb-2 text-green-600">📱 Device Information</h4>
            <div>Timestamp: {debugInfo.timestamp}</div>
            <div>Viewport: {debugInfo.viewport.width}x{debugInfo.viewport.height}</div>
            <div>Mobile Device: {debugInfo.isMobileDevice ? '✅ Yes' : '❌ No'}</div>
            <div>Touch Support: {debugInfo.touchSupport ? '✅ Yes' : '❌ No'}</div>
            <div className="mt-2 text-gray-600 break-all text-[10px]">
              User Agent: {debugInfo.userAgent}
            </div>
          </div>

          {/* System Status */}
          <div className="border p-3 rounded bg-blue-50">
            <h4 className="font-semibold mb-2 text-blue-600">⚙️ System Status</h4>
            <div>CSS Loaded: {debugInfo.cssLoaded ? '✅ Yes' : '❌ No'}</div>
            <div>JavaScript: {debugInfo.jsLoaded ? '✅ Working' : '❌ Failed'}</div>
            <div>Supabase: {debugInfo.supabaseConnected ? '✅ Connected' : '❌ Failed'}</div>
          </div>

          {/* DOM Analysis */}
          <div className="border p-3 rounded bg-purple-50">
            <h4 className="font-semibold mb-2 text-purple-600">🏗️ DOM Analysis</h4>
            <div>React Root: {document.getElementById('root') ? '✅ Found' : '❌ Missing'}</div>
            <div>Main App: {document.querySelector('[data-main-app]') ? '✅ Found' : '❌ Missing'}</div>
            <div>DOM Elements: {document.body.children.length} children in body</div>
            <div>Style Sheets: {document.styleSheets.length}</div>
            <div>Debug Components: {document.querySelectorAll('[id*="debug"], [class*="debug"]').length}</div>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="border p-3 rounded border-red-300 bg-red-50">
              <h4 className="font-semibold mb-2 text-red-600">🚨 Errors ({debugInfo.errors.length})</h4>
              <div className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-red-600 bg-red-100 p-2 rounded text-[10px]">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App Components Status */}
          <div className="border p-3 rounded bg-orange-50">
            <h4 className="font-semibold mb-2 text-orange-600">🧩 Components Status</h4>
            <div>Header: {document.querySelector('header') ? '✅ Present' : '❌ Missing'}</div>
            <div>Main: {document.querySelector('main') ? '✅ Present' : '❌ Missing'}</div>
            <div>Footer: {document.querySelector('footer') ? '✅ Present' : '❌ Missing'}</div>
            <div>Mobile Nav: {document.querySelector('[data-mobile-nav]') ? '✅ Present' : '❌ Missing'}</div>
          </div>

          {/* Quick Actions */}
          <div className="border p-3 rounded bg-gray-50">
            <h4 className="font-semibold mb-2 text-orange-600">⚡ Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-xs"
              >
                🔄 Reload Page
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 text-xs"
              >
                🗑️ Clear Cache
              </button>
              <button 
                onClick={() => {
                  console.log("Full debug info:", debugInfo);
                  console.log("DOM state:", {
                    body: document.body.innerHTML.length,
                    head: document.head.innerHTML.length,
                    scripts: document.scripts.length
                  });
                  alert("Debug info logged to console");
                }}
                className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-xs"
              >
                📋 Log to Console
              </button>
              <button 
                onClick={() => {
                  const mainApp = document.querySelector('[data-main-app]');
                  if (mainApp) {
                    mainApp.style.display = mainApp.style.display === 'none' ? '' : 'none';
                  }
                }}
                className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-xs"
              >
                👁️ Toggle Main App
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border p-3 rounded bg-yellow-50">
            <h4 className="font-semibold mb-2 text-yellow-800">📖 Instructions</h4>
            <div className="text-gray-700 text-xs">
              • Triple clic/tap n'importe où pour ouvrir/fermer ce panneau<br/>
              • Bouton "DEBUG AVANCÉ" dans la barre du haut<br/>
              • Icône 🔧 en haut à droite si fermé<br/>
              • Rouge = erreurs détectées<br/>
              • Partager ces informations pour le debug
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugger;
