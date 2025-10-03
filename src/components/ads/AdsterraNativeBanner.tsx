import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({ className, title = "Publicité" }) => {
  // Use a ref to get a direct reference to the container div
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure this effect runs only once by checking if the script was already added
    if (document.getElementById('adsterra-native-banner-script')) {
      console.log('Adsterra Native Banner script already exists.');
      return;
    }

    const container = adContainerRef.current;
    if (!container) {
      console.error('Adsterra Native Banner: Container div not found.');
      return;
    }

    console.log('Adsterra Native Banner: Component mounted, creating script...');
    // Create the script element
    const script = document.createElement('script');
    script.id = 'adsterra-native-banner-script';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    // This is the unique script source for your Native Banner
    script.src = "//pl27571954.revenuecpmgate.com/72/3f/32/db77c60f4499146c57ce5844c2/invoke.js";

    // Append the script directly to its container
    container.appendChild(script);
    console.log('Adsterra Native Banner: Script appended to container.');

    // Cleanup function to remove the script when the component unmounts
    return () => {
      const existingScript = document.getElementById('adsterra-native-banner-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
        console.log('Adsterra Native Banner: Script cleaned up.');
      }
    };
  }, []); // The empty dependency array ensures this runs only once.

  // Render the exact container div Adsterra requires, now with a ref
  return (
    <div
      ref={adContainerRef}
      id="container-723f32db77c60f4499146c57ce5844c2"
      className={className}
      style={{ minHeight: '100px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Fallback content while the ad loads */}
      <p style={{ color: '#555' }}>{title}</p>
    </div>
  );
};

export default AdsterraNativeBanner;