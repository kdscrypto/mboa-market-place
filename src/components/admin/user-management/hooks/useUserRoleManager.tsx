
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
