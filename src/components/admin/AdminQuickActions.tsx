
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  Shield, 
  Settings,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminQuickActionsProps {
  stats: {
    totalUsers: number;
    totalAds: number;
    pendingAds: number;
    totalMessages: number;
    unreviewed_security_events: number;
  } | undefined;
  moderators: any[] | undefined;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({ stats, moderators }) => {
  return (
    <div className="space-y-6">
      {/* Alertes critiques */}
      {stats?.unreviewed_security_events && stats.unreviewed_security_events > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{stats.unreviewed_security_events} événements de sécurité critiques</strong>
                <p className="text-sm mt-1">Nécessitent votre attention immédiate</p>
              </div>
              <Button asChild className="bg-red-600 hover:bg-red-700 ml-4">
                <Link to="/security">Réviser</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {stats?.pendingAds && stats.pendingAds > 20 && (
        <Alert className="border-orange-300 bg-orange-50">
          <FileText className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{stats.pendingAds} annonces en attente</strong>
                <p className="text-sm mt-1">File d'attente importante</p>
              </div>
              <Button asChild variant="outline" className="border-orange-300 ml-4">
                <Link to="/admin/moderation">Modérer</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Gestion des Modérateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Gérer les rôles et surveiller l'activité des modérateurs
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {moderators?.length || 0} actifs
              </Badge>
              <Button size="sm" variant="outline">
                Gérer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Modération des Annonces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Superviser et modérer les annonces publiées
            </p>
            <div className="flex items-center justify-between">
              <Badge 
                variant={stats?.pendingAds && stats.pendingAds > 10 ? "destructive" : "secondary"}
                className={stats?.pendingAds && stats.pendingAds > 10 ? "" : "bg-green-100 text-green-800"}
              >
                {stats?.pendingAds || 0} en attente
              </Badge>
              <Button asChild size="sm" className="bg-mboa-orange hover:bg-mboa-orange/90">
                <Link to="/admin/moderation">Accéder</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Sécurité & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Surveillance de la sécurité et tests de stress
            </p>
            <div className="flex items-center justify-between">
              <Badge 
                variant={stats?.unreviewed_security_events && stats.unreviewed_security_events > 0 ? "destructive" : "default"}
                className={stats?.unreviewed_security_events && stats.unreviewed_security_events > 0 ? "" : "bg-green-100 text-green-800"}
              >
                {stats?.unreviewed_security_events || 0} événements
              </Badge>
              <Button asChild size="sm" variant="outline">
                <Link to="/security">Tableau de Bord</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Analytics Avancées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Analyser les tendances et performance
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Temps réel
              </Badge>
              <Button size="sm" variant="outline">
                Analyser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Configuration Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Paramètres et configuration de la plateforme
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Configuration
              </Badge>
              <Button size="sm" variant="outline">
                Accéder
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-dashed border-2 border-gray-300">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Plus d'actions à venir</p>
              <Button size="sm" variant="ghost" disabled>
                Bientôt disponible
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminQuickActions;
