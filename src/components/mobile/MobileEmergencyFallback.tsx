
import React from 'react';

// Composant de secours ultra-simple pour mobile en cas d'erreur critique
const MobileEmergencyFallback: React.FC = () => {
  const [showFallback, setShowFallback] = React.useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = React.useState<any>(null);

  React.useEffect(() => {
    // Vérifier après 3 secondes si l'app principale s'est chargée
    const timer = setTimeout(() => {
      const mainApp = document.querySelector('[data-main-app]') || document.querySelector('main');
      const hasContent = mainApp && mainApp.children.length > 0;
      
      if (!hasContent) {
        console.log("App principale non détectée, activation du mode de secours");
        
        // Collecter des infos de diagnostic
        const info = {
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          react: !!(window as any).React,
          reactVersion: (window as any).React?.version,
          rootElement: !!document.getElementById('root'),
          rootChildren: document.getElementById('root')?.children.length || 0,
          mainElement: !!mainApp,
          timestamp: new Date().toISOString()
        };
        
        setDiagnosticInfo(info);
        setShowFallback(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!showFallback) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      zIndex: 999999
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#f59e0b'
        }}>
          🚨 Mode de Secours Activé
        </h1>
        
        <p style={{
          fontSize: '16px',
          marginBottom: '30px',
          lineHeight: '1.5'
        }}>
          L'application MBOA Market Place rencontre des difficultés de chargement sur votre appareil mobile.
        </p>
        
        <div style={{
          backgroundColor: '#374151',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '30px',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          <strong>Diagnostic :</strong><br/>
          React: {diagnosticInfo?.react ? '✅' : '❌'}<br/>
          Root: {diagnosticInfo?.rootElement ? '✅' : '❌'}<br/>
          Enfants: {diagnosticInfo?.rootChildren}<br/>
          Appareil: {diagnosticInfo?.userAgent?.includes('iPhone') ? 'iPhone' : 
                    diagnosticInfo?.userAgent?.includes('Android') ? 'Android' : 'Mobile'}<br/>
          Taille: {diagnosticInfo?.viewport}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Recharger l'application
          </button>
          
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('forceDesktop', 'true');
              window.location.href = url.toString();
            }}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            💻 Version Desktop
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🗑️ Réinitialiser les données
          </button>
        </div>
        
        <p style={{
          fontSize: '12px',
          marginTop: '30px',
          color: '#9ca3af'
        }}>
          Si le problème persiste, contactez le support technique.
        </p>
      </div>
    </div>
  );
};

export default MobileEmergencyFallback;
