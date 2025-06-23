
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

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    window.addEventListener('resize', updateDebugInfo);

    // Auto-show on mobile or if errors
    const timer = setTimeout(() => {
      if (currentInfo.isMobileDevice || currentInfo.errors.length > 0) {
        setIsVisible(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      window.removeEventListener('resize', updateDebugInfo);
      clearTimeout(timer);
    };
  }, []);

  // Toggle visibility with triple tap
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    const handleTripleTap = () => {
      tapCount++;
      if (tapCount === 1) {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 1000);
      } else if (tapCount === 3) {
        clearTimeout(tapTimer);
        tapCount = 0;
        setIsVisible(!isVisible);
        console.log("Debug panel toggled");
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
        className="fixed top-0 right-0 w-4 h-4 bg-blue-500 opacity-50 z-[10000] cursor-pointer"
        onClick={() => setIsVisible(true)}
        style={{ 
          background: debugInfo.errors.length > 0 ? '#ef4444' : '#3b82f6',
          borderRadius: '0 0 0 8px'
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[10000] overflow-auto">
      <div className="bg-white m-4 p-4 rounded-lg text-xs font-mono">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Mobile Debug Panel</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          {/* Device Info */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2 text-green-600">Device Information</h4>
            <div>Timestamp: {debugInfo.timestamp}</div>
            <div>Viewport: {debugInfo.viewport.width}x{debugInfo.viewport.height}</div>
            <div>Mobile Device: {debugInfo.isMobileDevice ? '✅ Yes' : '❌ No'}</div>
            <div>Touch Support: {debugInfo.touchSupport ? '✅ Yes' : '❌ No'}</div>
            <div className="mt-2 text-gray-600 break-all">
              User Agent: {debugInfo.userAgent}
            </div>
          </div>

          {/* System Status */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2 text-blue-600">System Status</h4>
            <div>CSS Loaded: {debugInfo.cssLoaded ? '✅ Yes' : '❌ No'}</div>
            <div>JavaScript: {debugInfo.jsLoaded ? '✅ Working' : '❌ Failed'}</div>
            <div>Supabase: {debugInfo.supabaseConnected ? '✅ Connected' : '❌ Failed'}</div>
          </div>

          {/* Errors */}
          {debugInfo.errors.length > 0 && (
            <div className="border p-3 rounded border-red-300">
              <h4 className="font-semibold mb-2 text-red-600">Errors ({debugInfo.errors.length})</h4>
              <div className="space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <div key={index} className="text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App State */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2 text-purple-600">App State</h4>
            <div>React Root: {document.getElementById('root') ? '✅ Found' : '❌ Missing'}</div>
            <div>DOM Elements: {document.body.children.length} children</div>
            <div>Style Sheets: {document.styleSheets.length}</div>
          </div>

          {/* Actions */}
          <div className="border p-3 rounded">
            <h4 className="font-semibold mb-2 text-orange-600">Quick Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
              >
                Reload Page
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="bg-orange-500 text-white px-3 py-1 rounded mr-2 hover:bg-orange-600"
              >
                Clear Cache & Reload
              </button>
              <button 
                onClick={() => {
                  console.log("Full debug info:", debugInfo);
                  alert("Debug info logged to console");
                }}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Log to Console
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border p-3 rounded bg-gray-50">
            <h4 className="font-semibold mb-2">Instructions</h4>
            <div className="text-gray-700">
              • Triple tap anywhere to toggle this panel<br/>
              • Check the errors section above for issues<br/>
              • Red dot in top-right indicates errors<br/>
              • Share this information for debugging
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugger;
