
import React from 'react';

interface SimpleMobileWrapperProps {
  children: React.ReactNode;
}

const SimpleMobileWrapper: React.FC<SimpleMobileWrapperProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export default SimpleMobileWrapper;
