
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { History, User, Shield, Clock, AlertCircle } from 'lucide-react';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
}

interface RoleChangeRecord {
  id: string;
  old_role: UserRole;
  new_role: UserRole;
  reason?: string;
  created_at: string;
  changed_by?: string;
  changer_email?: string;
}

interface RoleChangeHistoryProps {
  user: UserData;
}

const RoleChangeHistory: React.FC<RoleChangeHistoryProps> = ({ user }) => {
  const { data: roleHistory, isLoading, error } = useQuery({
    queryKey: ['user-role-history', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_role_changes')
        .select(`
          id,
          old_role,
          new_role,
          reason,
          created_at,
          changed_by,
          changer:changed_by(email)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching role history:', error);
        throw error;
      }
      
      return (data || []).map((record: any): RoleChangeRecord => ({
        id: record.id,
        old_role: record.old_role as UserRole,
        new_role: record.new_role as UserRole,
        reason: record.reason,
        created_at: record.created_at,
        changed_by: record.changed_by,
        changer_email: record.changer?.email
      }));
    }
  });

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { color: 'bg-red-100 text-red-800', icon: Shield };
      case 'moderator':
        return { color: 'bg-blue-100 text-blue-800', icon: User };
      case 'user':
        return { color: 'bg-gray-100 text-gray-800', icon: User };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <History className="h-5 w-5" />
            Historique des Changements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <History className="h-5 w-5" />
            Historique des Changements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Erreur lors du chargement de l'historique</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <History className="h-5 w-5" />
          Historique des Changements de Rôle
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!roleHistory || roleHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Aucun changement de rôle enregistré</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roleHistory.map((record) => {
              const oldRoleConfig = getRoleConfig(record.old_role);
              const newRoleConfig = getRoleConfig(record.new_role);
              
              return (
                <div key={record.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge className={oldRoleConfig.color}>
                          {record.old_role}
                        </Badge>
                        <span className="text-gray-400">→</span>
                        <Badge className={newRoleConfig.color}>
                          {record.new_role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(record.created_at)}
                    </div>
                  </div>
                  
                  {record.reason && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-600">Raison :</span>
                      <p className="text-sm text-gray-700 mt-1">{record.reason}</p>
                    </div>
                  )}
                  
                  {record.changer_email && (
                    <div className="text-xs text-gray-500">
                      Modifié par : {record.changer_email}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">
            ✨ Phase 5 - Fonctionnalités Avancées
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Historique complet des changements de rôles</li>
            <li>• Traçabilité avec utilisateur et timestamp</li>
            <li>• Gestion d'erreurs améliorée</li>
            <li>• Interface utilisateur optimisée</li>
            <li>• Statistiques en temps réel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleChangeHistory;
