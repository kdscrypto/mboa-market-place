
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Shield, 
  Activity,
  AlertTriangle,
  TrendingUp,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminOverview = () => {
  // Récupérer les statistiques globales
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: async () => {
      const [
        { data: totalUsers },
        { data: totalAds },
        { data: pendingAds },
        { data: totalMessages },
        { data: securityEvents }
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('payment_security_events').select('id', { count: 'exact', head: true }).eq('reviewed', false)
      ]);

      return {
        totalUsers: totalUsers?.length || 0,
        totalAds: totalAds?.length || 0,
        pendingAds: pendingAds?.length || 0,
        totalMessages: totalMessages?.length || 0,
        unreviewed_security_events: securityEvents?.length || 0
      };
    },
    refetchInterval: 30000
  });

  // Récupérer les modérateurs actifs
  const { data: moderators } = useQuery({
    queryKey: ['active-moderators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'moderator']);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes importantes */}
      {stats?.unreviewed_security_events > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Événements de sécurité non révisés</h4>
                  <p className="text-sm text-red-700">
                    {stats.unreviewed_security_events} événement(s) nécessitent votre attention
                  </p>
                </div>
              </div>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link to="/security-dashboard">Consulter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dont {moderators?.length || 0} modérateur(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Total</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAds || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingAds || 0} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total échangés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreviewed_security_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Événements non révisés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Modérateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Gérer les rôles et surveiller l'activité des modérateurs
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">{moderators?.length || 0} actifs</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Modération des Annonces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Superviser et modérer les annonces publiées
            </p>
            <Button asChild className="w-full bg-mboa-orange hover:bg-mboa-orange/90">
              <Link to="/admin/moderation">Accéder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Surveillance de la sécurité et tests de stress
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link to="/security-dashboard">Tableau de Bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
