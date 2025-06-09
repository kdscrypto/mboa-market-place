
import React from 'react';
import { CheckCircle, Archive, FileText, Sparkles } from 'lucide-react';

const Phase6Objectives: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
      <h3 className="font-semibold text-lg mb-3 text-green-800">Objectifs de la Phase 6</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Documentation complète</h4>
            <p className="text-sm text-green-700">
              Finaliser toute la documentation technique et utilisateur
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Archive className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Archivage complet</h4>
            <p className="text-sm text-blue-700">
              Archiver définitivement les données obsolètes
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-800">Rapport final</h4>
            <p className="text-sm text-purple-700">
              Générer le rapport final de migration
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800">Certification</h4>
            <p className="text-sm text-orange-700">
              Certifier la plateforme 100% gratuite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase6Objectives;
