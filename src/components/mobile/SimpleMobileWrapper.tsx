
import React from 'react';

interface SimpleMobileWrapperProps {
  children: React.ReactNode;
}

const SimpleMobileWrapper: React.FC<SimpleMobileWrapperProps> = ({ children }) => {
  return (
    <div className="w-full min-h-viewport">
      {children}
    </div>
  );
};

export default SimpleMobileWrapper;
