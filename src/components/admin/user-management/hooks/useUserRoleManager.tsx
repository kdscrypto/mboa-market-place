
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'user' | 'admin' | 'moderator';

interface UserData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  created_at: string;
  total_count: number;
}

export const useUserRoleManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>('user');

  // Mutation pour changer le rôle d'un utilisateur avec logging optimisé
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, reason }: { 
      userId: string; 
      newRole: UserRole; 
      reason?: string; 
    }) => {
      // Obtenir l'utilisateur actuel pour logging
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Obtenir l'ancien rôle
      const { data: oldUserData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Mettre à jour le rôle (utilise la nouvelle politique RLS)
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (updateError) throw updateError;

      // Enregistrer le changement dans l'historique
      const { error: logError } = await supabase
        .from('user_role_changes')
        .insert({
          user_id: userId,
          old_role: oldUserData.role,
          new_role: newRole,
          changed_by: currentUser.id,
          reason: reason || `Changement de rôle de ${oldUserData.role} vers ${newRole}`,
          metadata: {
            timestamp: new Date().toISOString(),
            changed_by_email: currentUser.email,
            rls_version: 'optimized'
          }
        });

      if (logError) {
        console.warn('Erreur lors de l\'enregistrement du log:', logError);
        // Ne pas faire échouer la mutation pour un problème de log
      }

      return { oldRole: oldUserData.role, newRole };
    },
    onSuccess: ({ newRole }) => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['moderators-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-search-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['user-role-history'] });
      queryClient.invalidateQueries({ queryKey: ['role-statistics'] });
      
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
      newRole: pendingRole,
      reason: `Changement de rôle effectué via l'interface d'administration (RLS optimisé)`
    });
  };

  return {
    selectedUser,
    setSelectedUser,
    dialogOpen,
    setDialogOpen,
    pendingRole,
    handleRoleChange,
    confirmRoleChange,
    isLoading: changeRoleMutation.isPending
  };
};
