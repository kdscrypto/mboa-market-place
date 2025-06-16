
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface SystemStatus {
  database: 'online' | 'offline' | 'degraded';
  security: 'normal' | 'elevated' | 'critical';
  moderation: 'active' | 'delayed' | 'inactive';
  lastUpdate: Date;
}

const AdminRealtimeStatus: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    security: 'normal',
    moderation: 'active',
    lastUpdate: new Date()
  });

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'elevated':
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'critical':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
      case 'active':
        return <Activity className="h-3 w-3 text-green-600" />;
      case 'degraded':
      case 'elevated':
      case 'delayed':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'offline':
      case 'critical':
      case 'inactive':
        return <WifiOff className="h-3 w-3 text-red-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
          État du Système en Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.database)}
              <span className="text-sm font-medium">Base de données</span>
            </div>
            <Badge className={getStatusColor(systemStatus.database)}>
              {systemStatus.database === 'online' ? 'En ligne' : 
               systemStatus.database === 'degraded' ? 'Dégradé' : 'Hors ligne'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.security)}
              <span className="text-sm font-medium">Sécurité</span>
            </div>
            <Badge className={getStatusColor(systemStatus.security)}>
              {systemStatus.security === 'normal' ? 'Normal' : 
               systemStatus.security === 'elevated' ? 'Élevé' : 'Critique'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemStatus.moderation)}
              <span className="text-sm font-medium">Modération</span>
            </div>
            <Badge className={getStatusColor(systemStatus.moderation)}>
              {systemStatus.moderation === 'active' ? 'Actif' : 
               systemStatus.moderation === 'delayed' ? 'Retardé' : 'Inactif'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <span>Dernière mise à jour:</span>
          <span>{systemStatus.lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRealtimeStatus;
