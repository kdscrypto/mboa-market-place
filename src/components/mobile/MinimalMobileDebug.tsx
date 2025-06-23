
import React from 'react';

// Composant de debug ultra-minimal pour mobile
const MinimalMobileDebug: React.FC = () => {
  // Ne pas utiliser useEffect qui pourrait causer des problèmes
  // Utiliser une approche purement déclarative
  
  React.useLayoutEffect(() => {
    // Diagnostic simple sans interférence
    const isMobile = window.innerWidth < 768;
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    
    console.log('=== DIAGNOSTIC MINIMAL ===');
    console.log('Mobile détecté:', isMobile);
    console.log('Android:', isAndroid);
    console.log('iOS:', isIOS);
    console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
    
    // Vérifier si React fonctionne
    const reactWorks = !!(window as any).React;
    console.log('React fonctionne:', reactWorks);
    
    // Créer un indicateur visuel simple seulement si erreur détectée
    const hasError = !(window as any).React || document.getElementById('root')?.children.length === 0;
    
    if (hasError) {
      const indicator = document.createElement('div');
      indicator.id = 'minimal-debug-indicator';
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
      indicator.textContent = 'ERREUR DÉTECTÉE - Diagnostic en cours...';
      document.body?.appendChild(indicator);
      
      // Diagnostic approfondi après 1 seconde
      setTimeout(() => {
        const rootEl = document.getElementById('root');
        const rootChildren = rootEl?.children.length || 0;
        
        indicator.textContent = `React: ${reactWorks ? 'OK' : 'KO'} | Root: ${rootChildren} enfants | Reload pour réparer`;
        indicator.onclick = () => window.location.reload();
      }, 1000);
    }
  }, []);

  return null; // Ne rend rien dans React
};

export default MinimalMobileDebug;
