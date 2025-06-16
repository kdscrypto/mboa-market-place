
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Search, Users, Zap, History } from 'lucide-react';
import UserSearchField from './UserSearchField';
import RoleChangeDialog from './RoleChangeDialog';
import UserInfoCard from './UserInfoCard';
import RoleCard from './RoleCard';
import RoleChangeHistory from './RoleChangeHistory';

// Define the allowed role types
type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
}

const EnhancedUserRoleManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>('user');

  // Mutation pour changer le rôle d'un utilisateur
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, { newRole }) => {
      queryClient.invalidateQueries({ queryKey: ['moderators-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-search-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['user-role-history'] });
      
      toast({
        title: "Succès",
        description: `Le rôle a été modifié vers "${newRole}" avec succès`,
      });
      
      // Mettre à jour l'utilisateur sélectionné
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error changing user role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur",
        variant: "destructive",
      });
      setDialogOpen(false);
    }
  });

  const handleRoleChange = (newRole: UserRole) => {
    if (!selectedUser) return;
    
    setPendingRole(newRole);
    setDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (!selectedUser || !pendingRole) return;
    
    changeRoleMutation.mutate({
      userId: selectedUser.id,
      newRole: pendingRole
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestionnaire de Rôles - Phase 3</h2>
            <p className="text-blue-100">
              Gérez les permissions et rôles des utilisateurs avec historique complet
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
              <div className="text-sm font-medium">Temps Réel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section de recherche */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Search className="h-5 w-5" />
            Recherche d'Utilisateur Avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UserSearchField
            onUserSelect={setSelectedUser}
            selectedUser={selectedUser}
          />
        </CardContent>
      </Card>

      {/* Section utilisateur sélectionné */}
      {selectedUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations utilisateur */}
          <div className="space-y-6">
            <UserInfoCard user={selectedUser} />
            <RoleChangeHistory user={selectedUser} />
          </div>

          {/* Gestion des rôles */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="h-5 w-5" />
                  Gestion des Rôles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <RoleCard
                    role="user"
                    isCurrentRole={selectedUser.role === 'user'}
                    onRoleChange={handleRoleChange}
                    disabled={changeRoleMutation.isPending}
                  />
                  <RoleCard
                    role="moderator"
                    isCurrentRole={selectedUser.role === 'moderator'}
                    onRoleChange={handleRoleChange}
                    disabled={changeRoleMutation.isPending}
                  />
                  <RoleCard
                    role="admin"
                    isCurrentRole={selectedUser.role === 'admin'}
                    onRoleChange={handleRoleChange}
                    disabled={changeRoleMutation.isPending}
                  />
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    ⚠️ Nouvelles fonctionnalités Phase 3
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Recherche paginée avec support UUID</li>
                    <li>• Historique complet des changements de rôle</li>
                    <li>• Journalisation automatique avec métadonnées</li>
                    <li>• Interface utilisateur améliorée</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog de confirmation */}
      <RoleChangeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmRoleChange}
        user={selectedUser}
        newRole={pendingRole}
        isLoading={changeRoleMutation.isPending}
      />
    </div>
  );
};

export default EnhancedUserRoleManager;
