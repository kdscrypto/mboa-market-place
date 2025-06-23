
import React from 'react';

const MinimalMobileDebug: React.FC = () => {
  React.useLayoutEffect(() => {
    console.log('=== DIAGNOSTIC SIMPLIFIÉ ===');
    
    // Diagnostic de base sans vérifications React obsolètes
    const isMobile = window.innerWidth < 768;
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    
    console.log('Mobile:', isMobile);
    console.log('Android:', isAndroid);
    console.log('iOS:', isIOS);
    console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
    
    // Vérifications DOM plus fiables
    const rootElement = document.getElementById('root');
    const hasMainApp = document.querySelector('[data-main-app]');
    const hasReactContent = rootElement && rootElement.innerHTML.length > 100;
    
    console.log('Root element:', !!rootElement);
    console.log('Main app marker:', !!hasMainApp);
    console.log('Has content:', hasReactContent);
    
    // Ne créer un indicateur d'erreur QUE si vraiment nécessaire
    const hasRealError = !rootElement || (!hasMainApp && !hasReactContent);
    
    if (hasRealError) {
      const indicator = document.createElement('div');
      indicator.id = 'simple-debug';
      indicator.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 35px !important;
        background: #1f2937 !important;
        color: white !important;
        z-index: 999999 !important;
        text-align: center !important;
        line-height: 35px !important;
        font-size: 13px !important;
        font-family: system-ui !important;
        cursor: pointer !important;
      `;
      
      indicator.textContent = '⚠️ Erreur de chargement - Cliquez pour recharger';
      indicator.onclick = () => window.location.reload();
      
      document.body?.appendChild(indicator);
      console.error('ERREUR DE CHARGEMENT DÉTECTÉE');
    } else {
      console.log('✅ Application chargée correctement');
    }
  }, []);

  return null;
};

export default MinimalMobileDebug;
