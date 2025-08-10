
import React from "react";

interface OrientationGuardProps {
  children: React.ReactNode;
}

// Minimal guard to avoid rendering during unstable orientation/viewport changes on mobile
const OrientationGuard: React.FC<OrientationGuardProps> = ({ children }) => {
  const [stable, setStable] = React.useState(true);

  React.useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isPortrait = window.matchMedia && window.matchMedia("(orientation: portrait)").matches;

    const markStableSoon = () => {
      setStable(false);
      // Let the viewport settle a bit, then render
      const id = window.setTimeout(() => setStable(true), 300);
      return () => clearTimeout(id);
    };

    let cleanup: (() => void) | null = null;

    if (isMobile && isPortrait) {
      cleanup = markStableSoon();
    }

    const onOrientationChange = () => {
      cleanup?.();
      cleanup = markStableSoon();
    };

    window.addEventListener("orientationchange", onOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", onOrientationChange);
      cleanup?.();
    };
  }, []);

  if (!stable) {
    return (
      <div className="min-h-viewport flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Stabilisation de l'affichage…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OrientationGuard;
