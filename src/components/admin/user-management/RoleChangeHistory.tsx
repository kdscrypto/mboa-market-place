
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, ArrowRight, Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
}

interface RoleChange {
  id: string;
  old_role: string;
  new_role: string;
  changed_by: string;
  reason?: string;
  created_at: string;
  metadata: any;
}

interface RoleChangeHistoryProps {
  user: UserData;
}

const RoleChangeHistory: React.FC<RoleChangeHistoryProps> = ({ user }) => {
  const { data: roleHistory, isLoading, error } = useQuery({
    queryKey: ['user-role-history', user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_role_history', {
        target_user_id: user.id
      });
      
      if (error) {
        console.error('Error fetching role history:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Administrateur'
        };
      case 'moderator':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Modérateur'
        };
      case 'user':
        return {
          color: 'bg-gray-100 text-gray-800',
          label: 'Utilisateur'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: role
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des Changements de Rôle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des Changements de Rôle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement de l'historique des rôles
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des Changements de Rôle
        </CardTitle>
      </CardHeader>
      <CardContent>
        {roleHistory && roleHistory.length > 0 ? (
          <div className="space-y-4">
            {roleHistory.map((change: RoleChange) => {
              const oldRoleConfig = getRoleConfig(change.old_role);
              const newRoleConfig = getRoleConfig(change.new_role);
              
              return (
                <div key={change.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={oldRoleConfig.color}>
                        {oldRoleConfig.label}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <Badge className={newRoleConfig.color}>
                        {newRoleConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(change.created_at)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Modifié par: {change.changed_by}</span>
                    </div>
                    
                    {change.reason && (
                      <div className="bg-gray-50 p-2 rounded">
                        <strong>Raison:</strong> {change.reason}
                      </div>
                    )}
                    
                    {change.metadata && (
                      <div className="text-xs text-gray-500">
                        {change.metadata.ip_address && (
                          <div>IP: {change.metadata.ip_address}</div>
                        )}
                        {change.metadata.user_agent && (
                          <div>User Agent: {change.metadata.user_agent}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun changement de rôle enregistré pour cet utilisateur</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleChangeHistory;
