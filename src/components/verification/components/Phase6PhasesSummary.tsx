
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const Phase6PhasesSummary: React.FC = () => {
  const phases = [
    { phase: 'Phase 1', name: 'Préparation', status: 'completed', description: 'Audit et planification' },
    { phase: 'Phase 2', name: 'Frontend', status: 'completed', description: 'Suppression composants Monetbil' },
    { phase: 'Phase 3', name: 'Base de données', status: 'completed', description: 'Migration et nettoyage' },
    { phase: 'Phase 4', name: 'Edge Functions', status: 'completed', description: 'Simplification des fonctions' },
    { phase: 'Phase 5', name: 'Vérification', status: 'completed', description: 'Tests et validation' },
    { phase: 'Phase 6', name: 'Documentation', status: 'completed', description: 'Finalisation et archivage' }
  ];

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">📋 Récapitulatif des phases</h3>
      <div className="space-y-3">
        {phases.map((phaseInfo) => (
          <div key={phaseInfo.phase} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">{phaseInfo.phase} - {phaseInfo.name}</span>
                <p className="text-sm text-gray-600">{phaseInfo.description}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              ✅ Terminé
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Phase6PhasesSummary;
