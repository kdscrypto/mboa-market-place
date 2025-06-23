
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
          height: 20px !important;
          background: linear-gradient(90deg, #ff0000, #00ff00, #0000ff) !important;
          z-index: 999999 !important;
          pointer-events: none !important;
          font-family: monospace !important;
          font-size: 12px !important;
          color: white !important;
          text-align: center !important;
          line-height: 20px !important;
          animation: pulse 1s infinite !important;
        `;
        indicator.textContent = 'DEBUG ACTIF - React chargé';
        
        document.body.appendChild(indicator);
        console.log("Visual indicator created successfully");

        // Test des capacités de base
        setTimeout(() => {
          indicator.textContent = `DEBUG: ${window.innerWidth}x${window.innerHeight} - Touch: ${('ontouchstart' in window) ? 'OUI' : 'NON'}`;
        }, 1000);

        // Rendre l'indicateur cliquable pour plus d'infos
        indicator.style.pointerEvents = 'all';
        indicator.onclick = () => {
          const debugInfo = {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent,
            touchSupport: 'ontouchstart' in window,
            timestamp: new Date().toISOString(),
            bodyChildren: document.body.children.length,
            reactRoot: !!document.getElementById('root'),
            cssLoaded: document.styleSheets.length > 0,
            jsErrors: window.onerror ? 'Handler installé' : 'Pas de handler'
          };
          
          // Essayer d'afficher les infos
          try {
            alert(`DEBUG INFO:\n${JSON.stringify(debugInfo, null, 2)}`);
          } catch (e) {
            console.error('Failed to show alert:', e);
          }
        };

      } catch (error) {
        console.error("Failed to create visual indicator:", error);
      }
    };

    // Créer l'indicateur immédiatement
    createVisualIndicator();

    // Capturer toutes les erreurs possibles
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      console.error("CAPTURED ERROR:", { message, source, lineno, colno, error });
      
      // Mettre à jour l'indicateur avec l'erreur
      const indicator = document.getElementById('ultra-debug-indicator');
      if (indicator) {
        indicator.style.background = '#ff0000';
        indicator.textContent = `ERREUR: ${message}`;
      }
      
      if (originalError) {
        originalError(message, source, lineno, colno, error);
      }
      return true;
    };

    // Capturer les rejets de promesses
    const originalRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      console.error("UNHANDLED REJECTION:", event.reason);
      
      const indicator = document.getElementById('ultra-debug-indicator');
      if (indicator) {
        indicator.style.background = '#ff8800';
        indicator.textContent = `PROMESSE REJETÉE: ${event.reason}`;
      }
      
      if (originalRejection) {
        originalRejection(event);
      }
    };

    return () => {
      // Nettoyer les handlers
      window.onerror = originalError;
      window.onunhandledrejection = originalRejection;
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement dans React
};

export default UltraBasicMobileDebug;
