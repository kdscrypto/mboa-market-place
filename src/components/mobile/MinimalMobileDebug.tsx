
import React from 'react';

const MinimalMobileDebug: React.FC = () => {
  React.useLayoutEffect(() => {
    // Diagnostic ultra-simple
    const isMobile = window.innerWidth < 768;
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    
    console.log('=== DIAGNOSTIC ULTRA-SIMPLE ===');
    console.log('Mobile:', isMobile);
    console.log('Android:', isAndroid);
    console.log('iOS:', isIOS);
    console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
    console.log('User Agent:', userAgent);
    
    // Vérifications React essentielles
    const reactExists = !!(window as any).React;
    const rootElement = document.getElementById('root');
    const rootChildren = rootElement?.children.length || 0;
    
    console.log('React existe:', reactExists);
    console.log('Root element:', !!rootElement);
    console.log('Root children:', rootChildren);
    
    // Indicateur visuel simplifié seulement si erreur majeure
    if (!reactExists || !rootElement || rootChildren === 0) {
      const indicator = document.createElement('div');
      indicator.id = 'ultra-simple-debug';
      indicator.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 40px !important;
        background: #dc2626 !important;
        color: white !important;
        z-index: 999999 !important;
        text-align: center !important;
        line-height: 40px !important;
        font-size: 14px !important;
        font-family: monospace !important;
      `;
      
      let message = 'ERREUR: ';
      if (!reactExists) message += 'React manquant';
      else if (!rootElement) message += 'Root manquant';
      else if (rootChildren === 0) message += 'Root vide';
      message += ' | Cliquez pour recharger';
      
      indicator.textContent = message;
      indicator.onclick = () => window.location.reload();
      
      document.body?.appendChild(indicator);
      
      console.error('ERREUR CRITIQUE DÉTECTÉE:', message);
    }
  }, []);

  return null;
};

export default MinimalMobileDebug;
