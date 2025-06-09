
import React from 'react';
import { Badge } from '@/components/ui/badge';

const Phase6Certification: React.FC = () => {
  return (
    <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border-2 border-green-300">
      <div className="text-4xl mb-4">🏆</div>
      <h3 className="text-xl font-bold text-green-800 mb-2">
        Certification de Migration Complète
      </h3>
      <p className="text-green-700 mb-4">
        La plateforme MBOA Market Place fonctionne désormais avec un système d'annonces 100% gratuit
      </p>
      <div className="flex justify-center items-center gap-2">
        <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
          ✅ MIGRATION RÉUSSIE
        </Badge>
        <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
          🎯 PHASE 6 TERMINÉE
        </Badge>
      </div>
      <p className="text-xs text-gray-600 mt-4">
        Date de completion : {new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  );
};

export default Phase6Certification;
