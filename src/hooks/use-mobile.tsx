
import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      try {
        const mobile = window.innerWidth < 768;
        console.log("Mobile detection:", { width: window.innerWidth, isMobile: mobile });
        setIsMobile(mobile);
      } catch (error) {
        console.error("Error in mobile detection:", error);
        // Fallback to false if there's an error
        setIsMobile(false);
      }
    };

    // Check on mount
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
};
