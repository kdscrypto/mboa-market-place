
import React, { useEffect } from 'react';

const UltraBasicMobileDebug: React.FC = () => {
  useEffect(() => {
    console.log("=== ULTRA BASIC DEBUG INITIALIZING ===");
    
    // Créer immédiatement un indicateur visuel simplifié
    const createVisualIndicator = () => {
      try {
        // Supprimer l'ancien indicateur s'il existe
        const existing = document.getElementById('ultra-debug-indicator');
        if (existing) {
          existing.remove();
        }

        // Créer un nouvel indicateur plus simple
        const indicator = document.createElement('div');
        indicator.id = 'ultra-debug-indicator';
        indicator.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 25px !important;
          background: #ff0000 !important;
          z-index: 999999 !important;
          pointer-events: all !important;
          font-family: monospace !important;
          font-size: 10px !important;
          color: white !important;
          text-align: center !important;
          line-height: 25px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 5px !important;
          cursor: pointer !important;
        `;
        
        indicator.textContent = 'DEBUG ACTIF - Cliquez pour diagnostic';
        document.body.appendChild(indicator);
        console.log("Visual indicator created successfully");

        // Diagnostic approfondi après un délai
        setTimeout(() => {
          const reactRootElement = document.getElementById('root');
          const mainAppElement = document.querySelector('[data-main-app]');
          const headerElement = document.querySelector('header');
          const mainElement = document.querySelector('main');
          
          console.log("=== DIAGNOSTIC DÉTAILLÉ ===");
          console.log("React Root:", reactRootElement ? 'TROUVÉ' : 'MANQUANT');
          console.log("React Root children:", reactRootElement?.children.length || 0);
          console.log("Main App Element:", mainAppElement ? 'TROUVÉ' : 'MANQUANT');
          console.log("Header Element:", headerElement ? 'TROUVÉ' : 'MANQUANT');
          console.log("Main Element:", mainElement ? 'TROUVÉ' : 'MANQUANT');
          
          // Vérifier les erreurs React dans la console
          const errors = (window as any).__REACT_ERROR_LOGS || [];
          console.log("React errors found:", errors.length);
          
          // Mettre à jour l'indicateur avec des infos plus précises
          let status = 'ERREUR REACT DÉTECTÉE';
          let bgColor = '#ff0000';
          
          if (!reactRootElement) {
            status = 'React Root manquant';
          } else if (reactRootElement.children.length === 0) {
            status = 'React Root vide - Erreur de rendu';
            bgColor = '#ff0000';
          } else if (!mainAppElement) {
            status = 'App principale manquante';
          } else if (!headerElement && !mainElement) {
            status = 'Composants principaux manquants';
          } else {
            status = 'Diagnostic OK';
            bgColor = '#00aa00';
          }
          
          indicator.style.background = bgColor;
          indicator.textContent = `DEBUG: ${status} - Cliquez pour plus`;
          
        }, 2000);

        // Gestionnaire de clic pour ouvrir l'outil avancé
        const handleDebugClick = () => {
          console.log("=== OUVERTURE OUTIL DIAGNOSTIC AVANCÉ ===");
          
          // Déclencher l'ouverture de l'outil de diagnostic avancé
          const advancedDebugEvent = new CustomEvent('openAdvancedDebug', {
            detail: { 
              source: 'ultra-basic-debug',
              timestamp: new Date().toISOString()
            }
          });
          window.dispatchEvent(advancedDebugEvent);
          
          // Afficher aussi les infos de diagnostic complet
          console.log("=== DIAGNOSTIC COMPLET ===");
          
          // Analyser tous les éléments DOM
          const allElements = document.querySelectorAll('*');
          const elementsByTag: { [key: string]: number } = {};
          allElements.forEach(el => {
            const tag = el.tagName.toLowerCase();
            elementsByTag[tag] = (elementsByTag[tag] || 0) + 1;
          });
          
          console.log("Éléments DOM par type:", elementsByTag);
          console.log("Nombre total d'éléments:", allElements.length);
          
          // Vérifier les scripts
          const scripts = document.querySelectorAll('script');
          console.log("Scripts chargés:", scripts.length);
          scripts.forEach((script, i) => {
            if (script.src) {
              console.log(`Script ${i}:`, script.src);
            }
          });
          
          // Vérifier les CSS
          const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
          console.log("Feuilles de style:", stylesheets.length);
          
          // Vérifier l'état de React
          const reactVersion = (window as any).React?.version;
          console.log("React version:", reactVersion || 'Non détectée');
          
          // Mettre à jour l'indicateur
          indicator.textContent = `DEBUG: ${allElements.length} éléments, ${scripts.length} scripts - Outil avancé ouvert`;
        };

        indicator.addEventListener('click', handleDebugClick);

      } catch (error) {
        console.error("Failed to create visual indicator:", error);
      }
    };

    // Créer l'indicateur immédiatement
    createVisualIndicator();

    // Capturer toutes les erreurs possibles
    const originalError = window.onerror;
    const errorHandler: OnErrorEventHandler = (message, source, lineno, colno, error) => {
      console.error("CAPTURED ERROR:", { message, source, lineno, colno, error });
      
      // Mettre à jour l'indicateur avec l'erreur
      const indicator = document.getElementById('ultra-debug-indicator');
      if (indicator) {
        indicator.style.background = '#ff0000';
        indicator.textContent = `ERREUR JS: ${String(message).substring(0, 50)}...`;
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
        indicator.style.background = '#ff8800';
        indicator.textContent = `PROMESSE REJETÉE: ${String(event.reason).substring(0, 40)}...`;
      }
    };

    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      // Nettoyer les handlers
      window.onerror = originalError;
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement dans React
};

export default UltraBasicMobileDebug;
