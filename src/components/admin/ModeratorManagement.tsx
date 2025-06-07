
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Activity,
  Shield,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ModeratorManagement = () => {
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

  // Mutation pour promouvoir un utilisateur
  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'moderator' })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators-list'] });
      toast({
        title: "Succès",
        description: "L'utilisateur a été promu modérateur",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de promouvoir l'utilisateur",
        variant: "destructive",
      });
    }
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

  const stats = getActivityStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques de modération */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modérateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderators?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dont {moderators?.filter(m => m.role === 'admin').length || 0} admin(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées (7j)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Annonces approuvées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées (7j)</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Annonces rejetées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des modérateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Équipe de Modération</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moderators?.map((moderator) => (
                <div key={moderator.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-mboa-orange rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {moderator.id.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">Modérateur {moderator.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={moderator.role === 'admin' ? 'default' : 'secondary'}>
                          {moderator.role}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Depuis {new Date(moderator.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedModerator(moderator.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {moderator.role === 'moderator' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => demoteMutation.mutate(moderator.id)}
                        disabled={demoteMutation.isPending}
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Détails du modérateur sélectionné */}
        {selectedModerator && moderatorDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du Modérateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">ID:</span> {selectedModerator.slice(0, 8)}...</p>
                    <p><span className="font-medium">Rôle:</span> {moderatorDetails.profile?.role}</p>
                    <p><span className="font-medium">Actif depuis:</span> {new Date(moderatorDetails.profile?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Activité Récente</h4>
                  <div className="text-sm space-y-1">
                    <p>Actions des 30 derniers jours: {moderatorDetails.recentActions.length}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedModerator(null)}
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alerte d'information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Seuls les administrateurs peuvent promouvoir ou rétrograder des modérateurs. 
          Toutes les actions sont enregistrées pour audit.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ModeratorManagement;
