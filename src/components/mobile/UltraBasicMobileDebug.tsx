
import React, { useEffect } from 'react';

const UltraBasicMobileDebug: React.FC = () => {
  useEffect(() => {
    console.log("=== ULTRA BASIC DEBUG INITIALIZING ===");
    
    // Créer immédiatement un indicateur visuel
    const createVisualIndicator = () => {
      try {
        // Supprimer l'ancien indicateur s'il existe
        const existing = document.getElementById('ultra-debug-indicator');
        if (existing) {
          existing.remove();
        }

        // Créer un nouvel indicateur très visible
        const indicator = document.createElement('div');
        indicator.id = 'ultra-debug-indicator';
        indicator.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 30px !important;
          background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff) !important;
          z-index: 999999 !important;
          pointer-events: none !important;
          font-family: monospace !important;
          font-size: 11px !important;
          color: white !important;
          text-align: center !important;
          line-height: 30px !important;
          animation: pulse 1s infinite !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 10px !important;
        `;
        
        // Contenu principal de l'indicateur
        const mainText = document.createElement('span');
        mainText.textContent = 'DEBUG ACTIF - React chargé';
        
        // Bouton pour ouvrir le debug avancé
        const debugButton = document.createElement('button');
        debugButton.textContent = 'DEBUG AVANCÉ';
        debugButton.style.cssText = `
          background: rgba(255,255,255,0.2) !important;
          border: 1px solid white !important;
          color: white !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          font-size: 10px !important;
          cursor: pointer !important;
          pointer-events: all !important;
        `;
        
        debugButton.onclick = () => {
          console.log("Debug avancé demandé");
          // Forcer l'ouverture du panneau de debug avancé
          const event = new CustomEvent('forceOpenDebugPanel');
          window.dispatchEvent(event);
        };
        
        indicator.appendChild(mainText);
        indicator.appendChild(debugButton);
        
        document.body.appendChild(indicator);
        console.log("Visual indicator created successfully");

        // Test des capacités détaillé
        setTimeout(() => {
          const debugInfo = {
            time: new Date().toISOString(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent,
            touchSupport: 'ontouchstart' in window,
            bodyChildren: document.body.children.length,
            reactRoot: !!document.getElementById('root'),
            cssLoaded: document.styleSheets.length > 0,
            mainApp: !!document.querySelector('[data-main-app]'),
            debugComponents: {
              ultraBasic: !!document.getElementById('ultra-debug-indicator'),
              emergency: !!document.querySelector('[data-emergency-mode]'),
              advanced: !!document.querySelector('[data-advanced-debug]')
            }
          };
          
          mainText.textContent = `DEBUG: ${debugInfo.viewport} - App: ${debugInfo.mainApp ? 'OUI' : 'NON'} - Touch: ${debugInfo.touchSupport ? 'OUI' : 'NON'}`;
          console.log("Diagnostic complet:", debugInfo);
          
          // Vérifier si les autres composants de debug sont présents
          if (!debugInfo.debugComponents.advanced) {
            console.warn("Le composant de debug avancé n'est pas détecté dans le DOM");
          }
        }, 1000);

        // Rendre l'indicateur principal cliquable pour plus d'infos
        indicator.style.pointerEvents = 'all';
        indicator.onclick = (e) => {
          if (e.target === indicator || e.target === mainText) {
            const debugInfo = {
              timestamp: new Date().toISOString(),
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              userAgent: navigator.userAgent,
              touchSupport: 'ontouchstart' in window,
              bodyChildren: document.body.children.length,
              reactRoot: !!document.getElementById('root'),
              cssLoaded: document.styleSheets.length > 0,
              jsErrors: window.onerror ? 'Handler installé' : 'Pas de handler',
              mainAppVisible: !!document.querySelector('[data-main-app]'),
              components: {
                header: !!document.querySelector('header'),
                main: !!document.querySelector('main'),
                footer: !!document.querySelector('footer'),
                mobileNav: !!document.querySelector('[data-mobile-nav]')
              },
              debugComponents: Array.from(document.querySelectorAll('[id*="debug"], [class*="debug"]')).map(el => el.id || el.className)
            };
            
            // Déclarer diagnosticText dans la portée appropriée
            const diagnosticText = `DIAGNOSTIC COMPLET:\n${JSON.stringify(debugInfo, null, 2)}`;
            
            // Essayer d'afficher les infos
            try {
              // Créer une div overlay avec les infos
              const overlay = document.createElement('div');
              overlay.style.cssText = `
                position: fixed !important;
                top: 40px !important;
                left: 10px !important;
                right: 10px !important;
                background: rgba(0,0,0,0.9) !important;
                color: white !important;
                padding: 15px !important;
                border-radius: 5px !important;
                font-family: monospace !important;
                font-size: 10px !important;
                z-index: 1000000 !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                white-space: pre-wrap !important;
              `;
              overlay.textContent = diagnosticText;
              
              const closeBtn = document.createElement('button');
              closeBtn.textContent = '✕ FERMER';
              closeBtn.style.cssText = `
                position: absolute !important;
                top: 5px !important;
                right: 5px !important;
                background: red !important;
                color: white !important;
                border: none !important;
                padding: 5px !important;
                cursor: pointer !important;
              `;
              closeBtn.onclick = () => overlay.remove();
              
              overlay.appendChild(closeBtn);
              document.body.appendChild(overlay);
              
              setTimeout(() => overlay.remove(), 10000); // Auto-remove après 10s
            } catch (e) {
              console.error('Failed to show diagnostic overlay:', e);
              alert(diagnosticText.substring(0, 1000) + '...'); // Fallback
            }
          }
        };

      } catch (error) {
        console.error("Failed to create visual indicator:", error);
      }
    };

    // Créer l'indicateur immédiatement
    createVisualIndicator();

    // Écouter l'événement personnalisé pour forcer l'ouverture du debug
    const handleForceDebugOpen = () => {
      console.log("Tentative d'ouverture forcée du debug avancé");
      
      // Essayer de déclencher l'ouverture du MobileDebugger
      const debuggerElement = document.querySelector('[data-mobile-debugger]');
      if (debuggerElement) {
        // Simuler un triple clic
        const clickEvent = new MouseEvent('click', { bubbles: true });
        debuggerElement.dispatchEvent(clickEvent);
        debuggerElement.dispatchEvent(clickEvent);
        debuggerElement.dispatchEvent(clickEvent);
      } else {
        console.warn("MobileDebugger element not found");
        alert("Le panneau de debug avancé n'est pas accessible. Vérifiez que le composant MobileDebugger est bien chargé.");
      }
    };

    window.addEventListener('forceOpenDebugPanel', handleForceDebugOpen);

    // Capturer toutes les erreurs possibles
    const originalError = window.onerror;
    const errorHandler: OnErrorEventHandler = (message, source, lineno, colno, error) => {
      console.error("CAPTURED ERROR:", { message, source, lineno, colno, error });
      
      // Mettre à jour l'indicateur avec l'erreur
      const indicator = document.getElementById('ultra-debug-indicator');
      if (indicator) {
        const mainText = indicator.querySelector('span');
        if (mainText) {
          indicator.style.background = '#ff0000';
          mainText.textContent = `ERREUR: ${message}`;
        }
      }
      
      if (originalError) {
        return originalError.call(window, message, source, lineno, colno, error);
      }
      return true;
    };
    
    window.onerror = errorHandler;

    // Capturer les rejets de promesses
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error("UNHANDLED REJECTION:", event.reason);
      
      const indicator = document.getElementById('ultra-debug-indicator');
      if (indicator) {
        const mainText = indicator.querySelector('span');
        if (mainText) {
          indicator.style.background = '#ff8800';
          mainText.textContent = `PROMESSE REJETÉE: ${event.reason}`;
        }
      }
    };

    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      // Nettoyer les handlers
      window.onerror = originalError;
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('forceOpenDebugPanel', handleForceDebugOpen);
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement dans React
};

export default UltraBasicMobileDebug;
