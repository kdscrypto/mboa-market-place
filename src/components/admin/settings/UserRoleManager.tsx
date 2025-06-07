
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserMinus, Shield, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserRoleManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation pour rétrograder un utilisateur spécifique
  const revokeModeratorMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'user' })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators-list'] });
      toast({
        title: "Succès",
        description: "Les droits de modérateur ont été révoqués avec succès",
      });
    },
    onError: (error) => {
      console.error('Error revoking moderator rights:', error);
      toast({
        title: "Erreur",
        description: "Impossible de révoquer les droits de modérateur",
        variant: "destructive",
      });
    }
  });

  // Mutation pour accorder les droits d'administrateur
  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators-list'] });
      toast({
        title: "Succès",
        description: "Les droits d'administrateur ont été accordés avec succès",
      });
    },
    onError: (error) => {
      console.error('Error granting admin rights:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accorder les droits d'administrateur",
        variant: "destructive",
      });
    }
  });

  const handleRevokeSpecificUser = () => {
    const userId = 'f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d';
    revokeModeratorMutation.mutate(userId);
  };

  const handleGrantAdminToSpecificUser = () => {
    const userId = 'f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d';
    grantAdminMutation.mutate(userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gestion des Rôles d'Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded bg-green-50">
            <h4 className="font-medium mb-2">Accorder les Droits d'Administrateur</h4>
            <p className="text-sm text-gray-600 mb-4">
              Accorder tous les droits d'administrateur à l'utilisateur : f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d
            </p>
            <Button
              onClick={handleGrantAdminToSpecificUser}
              disabled={grantAdminMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4" />
              {grantAdminMutation.isPending ? 'Attribution...' : 'Accorder les Droits Admin'}
            </Button>
          </div>

          <div className="p-4 border rounded bg-orange-50">
            <h4 className="font-medium mb-2">Révoquer les Droits de Modérateur</h4>
            <p className="text-sm text-gray-600 mb-4">
              Révoquer les droits de modérateur pour l'utilisateur : f7c3b7ea-5711-4f70-beec-7e5fa89c3c0d
            </p>
            <Button
              onClick={handleRevokeSpecificUser}
              disabled={revokeModeratorMutation.isPending}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <UserMinus className="h-4 w-4" />
              {revokeModeratorMutation.isPending ? 'Révocation...' : 'Révoquer les Droits'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
