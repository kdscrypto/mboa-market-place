
import React, { useState, useEffect } from 'react';

const MobileEmergencyMode: React.FC = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Simple mobile detection
    const checkMobile = () => {
      const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-enable emergency mode on mobile if main app fails to load
      if (mobile) {
        const timer = setTimeout(() => {
          const mainContent = document.querySelector('[data-main-app]');
          if (!mainContent || mainContent.children.length === 0) {
            console.log("Main app not detected, enabling emergency mode");
            setIsEmergencyMode(true);
          }
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isEmergencyMode) {
    return null;
  }

  const handleGoToDesktop = () => {
    // Add a parameter to force desktop view
    const url = new URL(window.location.href);
    url.searchParams.set('forceDesktop', 'true');
    window.location.href = url.toString();
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="text-6xl mb-4">📱</div>
        
        <h1 className="text-2xl font-bold text-gray-800">
          Mode d'urgence mobile
        </h1>
        
        <p className="text-gray-600">
          L'application semble avoir des difficultés à se charger sur votre appareil mobile. 
          Voici quelques options pour accéder au contenu :
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🔄 Recharger la page
          </button>
          
          <button 
            onClick={handleGoToDesktop}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            💻 Version desktop
          </button>
          
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            🗑️ Vider le cache
          </button>
          
          <button 
            onClick={() => setIsEmergencyMode(false)}
            className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            ❌ Fermer ce mode
          </button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Informations techniques :<br/>
            Appareil : {navigator.userAgent.includes('iPhone') ? 'iPhone' : 
                       navigator.userAgent.includes('Android') ? 'Android' : 'Mobile'}<br/>
            Taille : {window.innerWidth}x{window.innerHeight}<br/>
            Heure : {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileEmergencyMode;
