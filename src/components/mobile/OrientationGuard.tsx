import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

const OrientationGuard: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mboa-orange mx-auto mb-4" />
          <p>Initialisation de l'affichage…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OrientationGuard;
