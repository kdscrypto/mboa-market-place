
import React, { useState, useEffect } from 'react';

interface DiagnosticInfo {
  userAgent: string;
  screenDimensions: string;
  viewportDimensions: string;
  pixelRatio: number;
  touchSupport: boolean;
  orientation: string;
  batteryLevel?: number;
  connection?: string;
  memory?: number;
  jsErrors: string[];
  cssErrors: string[];
  networkErrors: string[];
  renderTime: number;
  domContentLoaded: boolean;
  allImagesLoaded: boolean;
  scriptsLoaded: boolean;
  stylesheetCount: number;
  domNodeCount: number;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webGL: boolean;
  canvas: boolean;
}

const MobileDiagnostic: React.FC = () => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [renderStartTime] = useState(Date.now());

  useEffect(() => {
    console.log("=== MOBILE DIAGNOSTIC COMPONENT MOUNTED ===");
    
    const collectDiagnosticInfo = async () => {
      console.log("Collecting diagnostic information...");
      
      const info: DiagnosticInfo = {
        userAgent: navigator.userAgent,
        screenDimensions: `${screen.width}x${screen.height}`,
        viewportDimensions: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: screen.orientation?.type || 'unknown',
        jsErrors: [],
        cssErrors: [],
        networkErrors: [],
        renderTime: Date.now() - renderStartTime,
        domContentLoaded: document.readyState === 'complete',
        allImagesLoaded: false,
        scriptsLoaded: false,
        stylesheetCount: document.styleSheets.length,
        domNodeCount: document.querySelectorAll('*').length,
        localStorage: checkLocalStorage(),
        sessionStorage: checkSessionStorage(),
        indexedDB: checkIndexedDB(),
        webGL: checkWebGL(),
        canvas: checkCanvas()
      };

      // Check battery if available
      try {
        const battery = await (navigator as any).getBattery?.();
        if (battery) {
          info.batteryLevel = Math.round(battery.level * 100);
        }
      } catch (e) {
        console.log("Battery API not available");
      }

      // Check connection
      try {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
          info.connection = `${connection.effectiveType || 'unknown'} - ${connection.downlink || 'unknown'}Mbps`;
        }
      } catch (e) {
        console.log("Network Information API not available");
      }

      // Check memory
      try {
        const memory = (performance as any).memory;
        if (memory) {
          info.memory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        }
      } catch (e) {
        console.log("Memory API not available");
      }

      // Check images loaded
      const images = document.querySelectorAll('img');
      let loadedImages = 0;
      images.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
          loadedImages++;
        }
      });
      info.allImagesLoaded = loadedImages === images.length;

      // Check scripts loaded
      const scripts = document.querySelectorAll('script[src]');
      info.scriptsLoaded = scripts.length > 0;

      console.log("Diagnostic info collected:", info);
      setDiagnosticInfo(info);
    };

    // Collect initial info
    collectDiagnosticInfo();

    // Set up error listeners
    const jsErrorHandler = (event: ErrorEvent) => {
      console.error("JS Error detected:", event.error);
      setDiagnosticInfo(prev => prev ? {
        ...prev,
        jsErrors: [...prev.jsErrors, `${event.filename}:${event.lineno} - ${event.message}`]
      } : prev);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      setDiagnosticInfo(prev => prev ? {
        ...prev,
        jsErrors: [...prev.jsErrors, `Promise rejection: ${event.reason}`]
      } : prev);
    };

    window.addEventListener('error', jsErrorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Show diagnostic after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => {
      window.removeEventListener('error', jsErrorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      clearTimeout(timer);
    };
  }, [renderStartTime]);

  const checkLocalStorage = (): boolean => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  const checkSessionStorage = (): boolean => {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  const checkIndexedDB = (): boolean => {
    return typeof indexedDB !== 'undefined';
  };

  const checkWebGL = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  };

  const checkCanvas = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (e) {
      return false;
    }
  };

  if (!isVisible || !diagnosticInfo) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10000,
        fontFamily: 'monospace'
      }}>
        Diagnostic en cours...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      zIndex: 10000,
      overflow: 'auto',
      padding: '20px',
      fontSize: '12px',
      fontFamily: 'monospace',
      lineHeight: '1.4'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#00ff00', marginBottom: '10px' }}>🔍 DIAGNOSTIC MOBILE</h2>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Fermer
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ffff00' }}>📱 INFORMATIONS APPAREIL</h3>
        <div>User Agent: {diagnosticInfo.userAgent}</div>
        <div>Écran: {diagnosticInfo.screenDimensions}</div>
        <div>Viewport: {diagnosticInfo.viewportDimensions}</div>
        <div>Pixel Ratio: {diagnosticInfo.pixelRatio}</div>
        <div>Touch: {diagnosticInfo.touchSupport ? '✅' : '❌'}</div>
        <div>Orientation: {diagnosticInfo.orientation}</div>
        {diagnosticInfo.batteryLevel && <div>Batterie: {diagnosticInfo.batteryLevel}%</div>}
        {diagnosticInfo.connection && <div>Connexion: {diagnosticInfo.connection}</div>}
        {diagnosticInfo.memory && <div>Mémoire JS: {diagnosticInfo.memory}MB</div>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ffff00' }}>⚡ PERFORMANCE</h3>
        <div>Temps de rendu: {diagnosticInfo.renderTime}ms</div>
        <div>DOM chargé: {diagnosticInfo.domContentLoaded ? '✅' : '❌'}</div>
        <div>Images chargées: {diagnosticInfo.allImagesLoaded ? '✅' : '❌'}</div>
        <div>Scripts chargés: {diagnosticInfo.scriptsLoaded ? '✅' : '❌'}</div>
        <div>Feuilles de style: {diagnosticInfo.stylesheetCount}</div>
        <div>Nœuds DOM: {diagnosticInfo.domNodeCount}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: '#ffff00' }}>💾 SUPPORT API</h3>
        <div>LocalStorage: {diagnosticInfo.localStorage ? '✅' : '❌'}</div>
        <div>SessionStorage: {diagnosticInfo.sessionStorage ? '✅' : '❌'}</div>
        <div>IndexedDB: {diagnosticInfo.indexedDB ? '✅' : '❌'}</div>
        <div>WebGL: {diagnosticInfo.webGL ? '✅' : '❌'}</div>
        <div>Canvas: {diagnosticInfo.canvas ? '✅' : '❌'}</div>
      </div>

      {diagnosticInfo.jsErrors.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#ff0000' }}>🚨 ERREURS JAVASCRIPT</h3>
          {diagnosticInfo.jsErrors.map((error, index) => (
            <div key={index} style={{ color: '#ff8888', marginBottom: '5px' }}>
              {error}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
        <h3 style={{ color: '#00ffff' }}>📋 INSTRUCTIONS</h3>
        <div>1. Prenez une capture d'écran de ces informations</div>
        <div>2. Notez particulièrement les ❌ et erreurs en rouge</div>
        <div>3. Testez sur plusieurs appareils problématiques</div>
        <div>4. Comparez avec un appareil fonctionnel</div>
      </div>
    </div>
  );
};

export default MobileDiagnostic;
