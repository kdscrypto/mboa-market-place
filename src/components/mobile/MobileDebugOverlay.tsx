
import React, { useState, useEffect } from 'react';

interface DebugLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

const MobileDebugOverlay: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [componentStatus, setComponentStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Override console methods to capture logs
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    const addLog = (level: 'info' | 'warn' | 'error', message: string, source: string = 'app') => {
      setLogs(prev => [
        ...prev.slice(-50), // Keep only last 50 logs
        {
          timestamp: Date.now(),
          level,
          message,
          source
        }
      ]);
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('info', args.join(' '), 'console');
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args.join(' '), 'console');
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args.join(' '), 'console');
    };

    // Track component mounting
    addLog('info', 'MobileDebugOverlay mounted', 'debug');

    // Monitor critical components
    const checkComponents = () => {
      setComponentStatus({
        header: !!document.querySelector('header'),
        footer: !!document.querySelector('footer'),
        mainContent: !!document.querySelector('main'),
        navigation: !!document.querySelector('nav'),
        mobileNav: !!document.querySelector('[data-mobile-nav]'),
        searchSection: !!document.querySelector('[data-search-section]'),
        categoriesSection: !!document.querySelector('[data-categories-section]'),
        adsSection: !!document.querySelector('[data-ads-section]')
      });
    };

    checkComponents();
    const interval = setInterval(checkComponents, 2000);

    // Show overlay after 3 seconds on mobile
    const timer = setTimeout(() => {
      if (window.innerWidth < 768) {
        setIsVisible(true);
      }
    }, 3000);

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '16px',
          zIndex: 9999,
          cursor: 'pointer'
        }}
      >
        🔍
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '40%',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      zIndex: 9999,
      overflow: 'auto',
      fontSize: '11px',
      fontFamily: 'monospace'
    }}>
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🐛 Debug Console Mobile</span>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <h4 style={{ color: '#28a745', margin: '0 0 5px 0' }}>Composants</h4>
          {Object.entries(componentStatus).map(([component, status]) => (
            <div key={component} style={{ fontSize: '10px' }}>
              {component}: {status ? '✅' : '❌'}
            </div>
          ))}
        </div>

        <div>
          <h4 style={{ color: '#ffc107', margin: '0 0 5px 0' }}>Logs ({logs.length})</h4>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {logs.slice(-20).map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.level === 'error' ? '#dc3545' : 
                        log.level === 'warn' ? '#ffc107' : '#ffffff',
                  fontSize: '10px',
                  marginBottom: '2px',
                  padding: '2px',
                  borderLeft: `2px solid ${
                    log.level === 'error' ? '#dc3545' : 
                    log.level === 'warn' ? '#ffc107' : '#007bff'
                  }`
                }}
              >
                <span style={{ color: '#888' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span> {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugOverlay;
