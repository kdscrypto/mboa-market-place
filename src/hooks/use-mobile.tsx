
import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      try {
        const width = window.innerWidth;
        const mobile = width < 768;
        console.log("Mobile detection (use-mobile):", { width, isMobile: mobile });
        setIsMobile(mobile);
      } catch (error) {
        console.error("Error in mobile detection:", error);
        setIsMobile(false);
      }
    };

    // Check on mount
    checkMobile();

    // Add event listener for resize
    const handleResize = () => {
      try {
        checkMobile();
      } catch (error) {
        console.error("Error in resize handler:", error);
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};
