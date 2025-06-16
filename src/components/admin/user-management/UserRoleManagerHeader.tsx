
import React from 'react';
import { Shield, History, Zap } from 'lucide-react';

const UserRoleManagerHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestionnaire de Rôles - Phase 4</h2>
          <p className="text-blue-100">
            Architecture refactorisée avec composants modulaires et maintenables
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Sécurisé</div>
          </div>
          <div className="text-center">
            <History className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Traçabilité</div>
          </div>
          <div className="text-center">
            <Zap className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Modulaire</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManagerHeader;
