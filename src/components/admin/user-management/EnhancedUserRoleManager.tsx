
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Search, Users, Zap } from 'lucide-react';
import UserSearchField from './UserSearchField';
import RoleChangeDialog from './RoleChangeDialog';
import UserInfoCard from './UserInfoCard';
import RoleCard from './RoleCard';

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
      queryClient.invalidateQueries({ queryKey: ['user-search'] });
      
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
            <h2 className="text-2xl font-bold mb-2">Gestionnaire de Rôles</h2>
            <p className="text-blue-100">
              Gérez les permissions et rôles des utilisateurs de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-1" />
              <div className="text-sm font-medium">Sécurisé</div>
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
            Recherche d'Utilisateur
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations utilisateur */}
          <div className="lg:col-span-1">
            <UserInfoCard user={selectedUser} />
          </div>

          {/* Gestion des rôles */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="h-5 w-5" />
                  Gestion des Rôles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    ⚠️ Important à retenir
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Les changements de rôle sont permanents et prennent effet immédiatement</li>
                    <li>• Les administrateurs ont accès à toutes les fonctionnalités</li>
                    <li>• Les modérateurs peuvent gérer le contenu et assister les utilisateurs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Section d'actions rapides (gardée pour compatibilité) */}
      <Card className="border border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Zap className="h-4 w-4" />
            Actions Rapides (Legacy)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded bg-blue-50">
              <h5 className="font-medium mb-2">Action prédéfinie</h5>
              <p className="text-sm text-gray-600 mb-3">
                Utilisateur: f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d
              </p>
              <Badge variant="outline" className="mb-2">
                Action héritée
              </Badge>
            </div>

            <div className="p-4 border rounded bg-orange-50">
              <h5 className="font-medium mb-2">Action prédéfinie</h5>
              <p className="text-sm text-gray-600 mb-3">
                Utilisateur: 54793d5a-027b-427b-a253-cb7b858c7728
              </p>
              <Badge variant="outline" className="mb-2">
                Action héritée
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
