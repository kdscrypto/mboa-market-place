
import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log("=== MOBILE DETECTION START ===");
    
    const checkMobile = () => {
      try {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const userAgent = navigator.userAgent;
        const mobile = width < 768;
        
        const debug = {
          width,
          height,
          mobile,
          userAgent: userAgent.substring(0, 50),
          timestamp: new Date().toISOString()
        };
        
        console.log("Mobile detection details:", debug);
        setDebugInfo(debug);
        setIsMobile(mobile);
        
        // Force DOM update
        document.documentElement.setAttribute('data-mobile', mobile.toString());
        document.documentElement.setAttribute('data-width', width.toString());
        
        console.log("Mobile state updated:", { isMobile: mobile });
        
      } catch (error) {
        console.error("CRITICAL ERROR in mobile detection:", error);
        console.error("Error stack:", error.stack);
        setIsMobile(false);
      }
    };

    // Initial check with delay to ensure DOM is ready
    setTimeout(() => {
      console.log("Initial mobile check with delay");
      checkMobile();
    }, 100);

    // Immediate check
    checkMobile();

    const handleResize = () => {
      console.log("Resize detected, rechecking mobile status");
      checkMobile();
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      console.log("Cleaning up mobile detection listeners");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Log every render
  console.log("useIsMobile render:", { isMobile, debugInfo });

  return isMobile;
};
