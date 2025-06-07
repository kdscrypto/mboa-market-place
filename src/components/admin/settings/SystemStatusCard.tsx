
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Shield, Bell } from 'lucide-react';

const SystemStatusCard = () => {
  const systemStatus = [
    {
      name: "Base de données",
      status: "operational",
      lastCheck: "Il y a 2 minutes",
      icon: <Database className="h-4 w-4" />
    },
    {
      name: "Système de sécurité",
      status: "operational", 
      lastCheck: "Il y a 1 minute",
      icon: <Shield className="h-4 w-4" />
    },
    {
      name: "Notifications",
      status: "operational",
      lastCheck: "Il y a 5 minutes", 
      icon: <Bell className="h-4 w-4" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Statut du Système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemStatus.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.lastCheck}</p>
                </div>
              </div>
              <Badge className={getStatusColor(item.status)}>
                {item.status === 'operational' ? 'Opérationnel' : 'Problème'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
