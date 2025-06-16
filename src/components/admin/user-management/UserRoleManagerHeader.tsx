
import React from 'react';
import { Shield, Users } from 'lucide-react';

const UserRoleManagerHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestionnaire de Rôles Utilisateur</h2>
          <p className="text-blue-100">
            Gérez les rôles et permissions des utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Sécurisé</div>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Gestion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManagerHeader;
