import React, { useEffect, useRef, useState } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({ className, title = "Publicité" }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document.getElementById('adsterra-native-banner-script')) {
      console.log('Adsterra Native Banner script already exists.');
      setIsLoading(false);
      return;
    }

    const container = adContainerRef.current;
    if (!container) {
      console.error('Adsterra Native Banner: Container div not found.');
      setIsLoading(false);
      return;
    }

    // Set a timeout to hide the loader if no ad loads after 10 seconds
    const timer = setTimeout(() => {
      console.log('Adsterra: Ad loading timed out. Hiding loader.');
      setIsLoading(false);
    }, 10000);

    console.log('Adsterra Native Banner: Component mounted, creating script...');
    const script = document.createElement('script');
    script.id = 'adsterra-native-banner-script';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = "//pl27571954.revenuecpmgate.com/72/3f/32/db77c60f4499146c57ce5844c2/invoke.js";

    script.onload = () => {
      console.log('Adsterra: invoke.js script has loaded.');
      clearTimeout(timer);
      setTimeout(() => setIsLoading(false), 1500);
    };
    
    script.onerror = () => {
      console.error('Adsterra: invoke.js script failed to load.');
      clearTimeout(timer);
      setIsLoading(false);
    };

    container.appendChild(script);
    console.log('Adsterra Native Banner: Script appended to container.');

    return () => {
      clearTimeout(timer);
      const existingScript = document.getElementById('adsterra-native-banner-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
        console.log('Adsterra Native Banner: Script cleaned up.');
      }
    };
  }, []);

  return (
    <div
      ref={adContainerRef}
      id="container-723f32db77c60f4499146c57ce5844c2"
      className={className}
      style={{ minHeight: '100px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <p style={{ color: '#555' }}>{title}</p>
      {isLoading && (
        <span style={{ marginLeft: '10px', color: '#777' }}> Chargement...</span>
      )}
    </div>
  );
};

export default AdsterraNativeBanner;