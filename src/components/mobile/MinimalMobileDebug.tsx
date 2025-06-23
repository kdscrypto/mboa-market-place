
import React from 'react';

const MinimalMobileDebug: React.FC = () => {
  React.useLayoutEffect(() => {
    console.log('=== DIAGNOSTIC MOBILE SIMPLIFIÉ ===');
    
    try {
      // Diagnostic de base
      const isMobile = window.innerWidth < 768;
      const userAgent = navigator.userAgent;
      const isAndroid = /Android/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      
      console.log('Mobile:', isMobile);
      console.log('Android:', isAndroid);
      console.log('iOS:', isIOS);
      console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
      
      // Vérifications DOM simplifiées
      const rootElement = document.getElementById('root');
      const hasMainApp = document.querySelector('[data-main-app]');
      
      console.log('Root element exists:', !!rootElement);
      console.log('Main app found:', !!hasMainApp);
      
      // Ne créer un indicateur que si vraiment nécessaire
      if (!rootElement) {
        console.error('ERREUR CRITIQUE: Element root manquant');
        
        const indicator = document.createElement('div');
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
          font-family: system-ui !important;
        `;
        
        indicator.textContent = '⚠️ Erreur critique - Rechargement nécessaire';
        indicator.onclick = () => window.location.reload();
        
        document.body?.appendChild(indicator);
      } else {
        console.log('✅ Application mobile OK');
      }
    } catch (error) {
      console.error('Erreur dans MinimalMobileDebug:', error);
    }
  }, []);

  return null;
};

export default MinimalMobileDebug;
