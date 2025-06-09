
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const Phase6Header: React.FC = () => {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-green-600" />
        <div>
          <CardTitle className="text-xl text-green-800">
            🎉 Phase 6 - Documentation finale et archivage complet
          </CardTitle>
          <p className="text-green-600 text-sm mt-1">
            Finalisation et archivage de la migration Monetbil
          </p>
        </div>
      </div>
    </CardHeader>
  );
};

export default Phase6Header;
