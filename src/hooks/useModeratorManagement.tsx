
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModeratorManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModerator, setSelectedModerator] = useState<string | null>(null);

  // Récupérer la liste des modérateurs
  const { data: moderators, isLoading } = useQuery({
    queryKey: ['moderators-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'moderator'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Récupérer l'activité des modérateurs
  const { data: moderatorActivity } = useQuery({
    queryKey: ['moderator-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('status, updated_at')
        .neq('status', 'pending')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  // Récupérer les détails d'un modérateur spécifique
  const { data: moderatorDetails } = useQuery({
    queryKey: ['moderator-details', selectedModerator],
    queryFn: async () => {
      if (!selectedModerator) return null;
      
      const [
        { data: profile },
        { data: recentActions }
      ] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', selectedModerator)
          .single(),
        supabase
          .from('ads')
          .select('id, title, status, updated_at')
          .neq('status', 'pending')
          .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(10)
      ]);
      
      return {
        profile: profile || null,
        recentActions: recentActions || []
      };
    },
    enabled: !!selectedModerator
  });

  // Mutation pour rétrograder un modérateur
  const demoteMutation = useMutation({
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
        description: "Le modérateur a été rétrogradé",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de rétrograder le modérateur",
        variant: "destructive",
      });
    }
  });

  const getActivityStats = () => {
    if (!moderatorActivity) return { approved: 0, rejected: 0 };
    
    return {
      approved: moderatorActivity.filter(ad => ad.status === 'approved').length,
      rejected: moderatorActivity.filter(ad => ad.status === 'rejected').length
    };
  };

  return {
    moderators,
    moderatorActivity,
    moderatorDetails,
    selectedModerator,
    setSelectedModerator,
    demoteMutation,
    getActivityStats,
    isLoading
  };
};
