
import React, { useEffect } from 'react';

const UltraBasicMobileDebug: React.FC = () => {
  useEffect(() => {
    console.log("=== ULTRA BASIC DEBUG INITIALIZING ===");
    
    // Fonction pour créer l'indicateur de manière ultra-sécurisée
    const createVisualIndicator = () => {
      try {
        // Supprimer l'ancien indicateur s'il existe
        const existing = document.getElementById('ultra-debug-indicator');
        if (existing) {
          existing.remove();
        }

        // Créer un nouvel indicateur plus simple et plus robuste
        const indicator = document.createElement('div');
        indicator.id = 'ultra-debug-indicator';
        
        // Styles CSS inline pour éviter les conflits
        const styles = [
          'position: fixed !important',
          'top: 0 !important',
          'left: 0 !important',
          'width: 100vw !important',
          'height: 30px !important',
          'background: #dc2626 !important',
          'z-index: 999999 !important',
          'pointer-events: all !important',
          'font-family: monospace !important',
          'font-size: 11px !important',
          'color: white !important',
          'text-align: center !important',
          'line-height: 30px !important',
          'display: flex !important',
          'align-items: center !important',
          'justify-content: center !important',
          'padding: 0 10px !important',
          'cursor: pointer !important',
          'box-sizing: border-box !important'
        ];
        
        indicator.style.cssText = styles.join('; ');
        indicator.textContent = '🔧 DEBUG ACTIF - React Error Detected - Cliquez pour diagnostic';
        
        // Ajouter au body de manière sécurisée
        if (document.body) {
          document.body.appendChild(indicator);
          console.log("Visual indicator created successfully");
        } else {
          console.error("Document.body not available");
          return;
        }

        // Diagnostic immédiat et simplifié
        const performDiagnostic = () => {
          try {
            const rootElement = document.getElementById('root');
            const reactDetected = !!(window as any).React;
            const rootHasChildren = rootElement ? rootElement.children.length : 0;
            
            console.log("=== DIAGNOSTIC SIMPLIFIÉ ===");
            console.log("Root element:", rootElement ? 'TROUVÉ' : 'MANQUANT');
            console.log("Root children count:", rootHasChildren);
            console.log("React detected:", reactDetected);
            console.log("React version:", (window as any).React?.version || 'Non détectée');
            
            // Vérifier les erreurs stockées
            const renderError = (window as any).__RENDER_ERROR;
            const importError = (window as any).__IMPORT_ERROR;
            const reactErrors = (window as any).__REACT_ERROR_LOGS || [];
            
            console.log("Render errors:", !!renderError);
            console.log("Import errors:", !!importError);
            console.log("React error logs:", reactErrors.length);
            
            // Mettre à jour l'indicateur avec le diagnostic
            let status = 'ERROR DETECTED';
            let bgColor = '#dc2626';
            
            if (!rootElement) {
              status = 'ROOT ELEMENT MISSING';
            } else if (!reactDetected) {
              status = 'REACT NOT DETECTED';
            } else if (rootHasChildren === 0) {
              status = 'REACT ROOT EMPTY';
            } else if (renderError) {
              status = 'RENDER ERROR';
            } else if (importError) {
              status = 'IMPORT ERROR';
            } else if (reactErrors.length > 0) {
              status = 'REACT ERRORS';
            } else {
              status = 'DIAGNOSTIC OK';
              bgColor = '#059669';
            }
            
            indicator.style.background = bgColor + ' !important';
            indicator.textContent = `🔧 DEBUG: ${status} - Cliquez pour plus d'infos`;
            
          } catch (diagError) {
            console.error("Diagnostic failed:", diagError);
            indicator.textContent = '🔧 DEBUG: Diagnostic failed - Cliquez pour reload';
          }
        };

        // Lancer le diagnostic après un court délai
        setTimeout(performDiagnostic, 1000);

        // Gestionnaire de clic simplifié
        const handleDebugClick = () => {
          try {
            console.log("=== DEBUG CLICK HANDLER ===");
            
            // Afficher les informations complètes
            const diagnosticInfo = {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              viewport: `${window.innerWidth}x${window.innerHeight}`,
              reactVersion: (window as any).React?.version || 'Non détectée',
              rootElement: !!document.getElementById('root'),
              rootChildren: document.getElementById('root')?.children.length || 0,
              renderError: (window as any).__RENDER_ERROR?.message || 'None',
              importError: (window as any).__IMPORT_ERROR?.message || 'None',
              reactErrors: ((window as any).__REACT_ERROR_LOGS || []).length,
              totalElements: document.querySelectorAll('*').length,
              scripts: document.querySelectorAll('script').length,
              stylesheets: document.querySelectorAll('link[rel="stylesheet"], style').length
            };
            
            console.log("=== DIAGNOSTIC COMPLET ===", diagnosticInfo);
            
            // Déclencher l'ouverture de l'outil avancé si possible
            const advancedDebugEvent = new CustomEvent('openAdvancedDebug', {
              detail: { 
                source: 'ultra-basic-debug',
                diagnosticInfo
              }
            });
            window.dispatchEvent(advancedDebugEvent);
            
            // Mettre à jour l'indicateur
            indicator.textContent = `🔧 DEBUG: Info logged - ${diagnosticInfo.totalElements} elements total`;
            
          } catch (clickError) {
            console.error("Click handler error:", clickError);
            // En cas d'erreur, proposer un reload simple
            if (confirm('Erreur dans le diagnostic. Recharger la page ?')) {
              window.location.reload();
            }
          }
        };

        // Attacher le gestionnaire de clic
        indicator.addEventListener('click', handleDebugClick);
        
        // Stocker la référence pour nettoyage
        (window as any).__DEBUG_INDICATOR = indicator;

      } catch (error) {
        console.error("Failed to create visual indicator:", error);
        
        // Fallback ultra-simple en cas d'échec total
        try {
          const simpleDiv = document.createElement('div');
          simpleDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:25px;background:red;color:white;text-align:center;z-index:999999;font-size:12px;line-height:25px;';
          simpleDiv.textContent = 'DEBUG: Error creating indicator - Click to reload';
          simpleDiv.onclick = () => window.location.reload();
          document.body?.appendChild(simpleDiv);
        } catch (fallbackError) {
          console.error("Even fallback failed:", fallbackError);
        }
      }
    };

    // Créer l'indicateur immédiatement
    createVisualIndicator();

    // Nettoyer à la destruction du composant
    return () => {
      try {
        const indicator = document.getElementById('ultra-debug-indicator');
        if (indicator) {
          indicator.remove();
        }
        delete (window as any).__DEBUG_INDICATOR;
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement dans React
};

export default UltraBasicMobileDebug;
