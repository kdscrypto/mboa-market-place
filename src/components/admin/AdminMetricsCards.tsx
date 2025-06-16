
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Shield, 
  MessageCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface AdminMetricsCardsProps {
  stats: {
    totalUsers: number;
    totalAds: number;
    pendingAds: number;
    totalMessages: number;
    unreviewed_security_events: number;
  } | undefined;
  moderators: any[] | undefined;
}

const AdminMetricsCards: React.FC<AdminMetricsCardsProps> = ({ stats, moderators }) => {
  return (
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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {stats?.pendingAds || 0} en attente
            </p>
            {(stats?.pendingAds || 0) > 10 && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
          </div>
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

      <Card className={stats?.unreviewed_security_events ? "border-red-300 bg-red-50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
          <Shield className={`h-4 w-4 ${stats?.unreviewed_security_events ? 'text-red-600' : 'text-green-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats?.unreviewed_security_events ? 'text-red-600' : 'text-green-600'}`}>
            {stats?.unreviewed_security_events || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Événements non révisés
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetricsCards;
