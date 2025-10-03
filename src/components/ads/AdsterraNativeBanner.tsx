// src/components/ads/AdsterraNativeBanner.tsx (Debugging Version)

import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  title?: string;
}

const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({ className, title = "Ad Container (Waiting for script)" }) => {
  console.log('--- [STEP 1] AdsterraNativeBanner: Component is rendering ---');
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('--- [STEP 2] AdsterraNativeBanner: useEffect hook has started ---');

    // Check if the script was somehow added before
    if (document.getElementById('adsterra-native-banner-script')) {
      console.warn('AdsterraNativeBanner: Script with this ID already exists. Aborting.');
      return;
    }

    const container = adContainerRef.current;
    console.log('--- [STEP 3] AdsterraNativeBanner: Checking container ref ---', container);

    if (!container) {
      console.error('!!! FAILURE !!! AdsterraNativeBanner: Container div ref is null or undefined. useEffect cannot proceed. This is the likely cause of the problem.');
      return; // Exit because we have nowhere to put the script
    }

    console.log('--- [STEP 4] AdsterraNativeBanner: Container found. Creating script element... ---');
    const script = document.createElement('script');
    script.id = 'adsterra-native-banner-script';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = "//pl27571954.revenuecpmgate.com/72/3f/32/db77c60f4499146c57ce5844c2/invoke.js";

    container.appendChild(script);
    console.log('--- [STEP 5] AdsterraNativeBanner: SUCCESS! Script appended to container. Check the Network tab now. ---');

    return () => {
      console.log('AdsterraNativeBanner: Cleanup function running.');
      const existingScript = document.getElementById('adsterra-native-banner-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []); // Empty array ensures this runs once after the component mounts

  // Render the container with the ref attached
  return (
    <div
      ref={adContainerRef}
      id="container-723f32db77c60f4499146c57ce5844c2"
      className={className}
      style={{ minHeight: '100px', border: '2px dashed blue', padding: '10px' }} // Added a dashed border for visibility
    >
      <p style={{ color: '#888' }}>{title}</p>
    </div>
  );
};

export default AdsterraNativeBanner;