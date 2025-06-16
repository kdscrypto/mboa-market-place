
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, UserMinus, History } from 'lucide-react';
import UserSearchField from './UserSearchField';
import RoleChangeDialog from './RoleChangeDialog';

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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestionnaire de Rôles Avancé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Champ de recherche */}
          <div>
            <h4 className="font-medium mb-3">Rechercher un utilisateur</h4>
            <UserSearchField
              onUserSelect={setSelectedUser}
              selectedUser={selectedUser}
            />
          </div>

          {/* Informations utilisateur sélectionné */}
          {selectedUser && (
            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Utilisateur sélectionné</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">{selectedUser.email}</div>
                    {selectedUser.username && (
                      <div className="text-sm text-gray-600">@{selectedUser.username}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {selectedUser.id}
                    </div>
                  </div>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>

                {/* Actions de changement de rôle */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Actions disponibles:</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.role !== 'admin' && (
                      <Button
                        onClick={() => handleRoleChange('admin')}
                        disabled={changeRoleMutation.isPending}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Promouvoir Admin
                      </Button>
                    )}
                    
                    {selectedUser.role !== 'moderator' && (
                      <Button
                        onClick={() => handleRoleChange('moderator')}
                        disabled={changeRoleMutation.isPending}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Promouvoir Modérateur
                      </Button>
                    )}
                    
                    {selectedUser.role !== 'user' && (
                      <Button
                        onClick={() => handleRoleChange('user')}
                        disabled={changeRoleMutation.isPending}
                        size="sm"
                        variant="destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Rétrograder Utilisateur
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions rapides (gardées pour compatibilité) */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Actions Rapides (Legacy)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded bg-blue-50">
                <h5 className="font-medium mb-2">Action prédéfinie</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Utilisateur: f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d
                </p>
                <Button
                  onClick={() => changeRoleMutation.mutate({
                    userId: 'f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d',
                    newRole: 'admin'
                  })}
                  disabled={changeRoleMutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accorder Admin
                </Button>
              </div>

              <div className="p-4 border rounded bg-orange-50">
                <h5 className="font-medium mb-2">Action prédéfinie</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Utilisateur: 54793d5a-027b-427b-a253-cb7b858c7728
                </p>
                <Button
                  onClick={() => changeRoleMutation.mutate({
                    userId: '54793d5a-027b-427b-a253-cb7b858c7728',
                    newRole: 'moderator'
                  })}
                  disabled={changeRoleMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Accorder Modérateur
                </Button>
              </div>
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
