
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface VerificationHeaderProps {
  isRunning: boolean;
  onRunTests: () => void;
}

const VerificationHeader: React.FC<VerificationHeaderProps> = ({
  isRunning,
  onRunTests
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">🎯 Phase 6 - Documentation finale et archivage complet</h2>
      <Button
        onClick={onRunTests}
        disabled={isRunning}
        className="bg-mboa-orange hover:bg-mboa-orange/90"
      >
        {isRunning ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Tests Phase 6 en cours...
          </>
        ) : (
          'Exécuter tests Phase 6'
        )}
      </Button>
    </div>
  );
};

export default VerificationHeader;
