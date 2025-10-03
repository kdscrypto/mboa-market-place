import React, { useEffect, useState } from "react";

interface AdsterraSocialBarProps {
  className?: string;
}

const AdsterraSocialBar: React.FC<AdsterraSocialBarProps> = ({
  className
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile
  if (!isMobile) {
    console.log(`📱 Adsterra Social Bar hidden - not on mobile device`);
    return null;
  }

  // The Social Bar script is loaded globally in index.html
  // It automatically injects itself into the page
  // This component just provides a placeholder container if needed
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      style={{ height: '50px' }}
    >
      {/* Social Bar will be injected here by the global script */}
    </div>
  );
};

export default AdsterraSocialBar;