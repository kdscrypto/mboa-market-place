
import React from 'react';
import { Shield, History, Zap, BarChart3, TrendingUp, Database } from 'lucide-react';

const UserRoleManagerHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestionnaire de Rôles - Phase 5</h2>
          <p className="text-blue-100">
            Système avancé avec historique complet, statistiques temps réel et gestion d'erreurs robuste
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Sécurisé</div>
          </div>
          <div className="text-center">
            <History className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Traçabilité</div>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Analytics</div>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-1" />
            <div className="text-sm font-medium">Optimisé</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">Nouvelles fonctionnalités</span>
          </div>
          <ul className="text-xs text-blue-100 space-y-1">
            <li>• Historique détaillé des changements</li>
            <li>• Statistiques avancées par rôle</li>
          </ul>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Améliorations techniques</span>
          </div>
          <ul className="text-xs text-blue-100 space-y-1">
            <li>• Requêtes SQL optimisées</li>
            <li>• Gestion d'erreurs robuste</li>
          </ul>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          <ul className="text-xs text-blue-100 space-y-1">
            <li>• Interface utilisateur fluide</li>
            <li>• Chargement optimisé</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserRoleManagerHeader;
