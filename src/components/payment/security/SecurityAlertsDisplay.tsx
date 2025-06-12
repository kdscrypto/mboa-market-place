
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAlert {
  id: string;
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'fraud_detection' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  userId?: string;
  transactionId?: string;
  resolved: boolean;
}

interface SecurityAlertsDisplayProps {
  transactionId?: string;
  userId?: string;
  className?: string;
}

const severityConfig = {
  low: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Shield,
    iconColor: 'text-blue-600'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-600'
  },
  high: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    iconColor: 'text-orange-600'
  },
  critical: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: Ban,
    iconColor: 'text-red-600'
  }
};

const SecurityAlertsDisplay: React.FC<SecurityAlertsDisplayProps> = ({
  transactionId,
  userId,
  className
}) => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des alertes de sécurité
    // Dans un vrai système, cela viendrait d'une API ou de Supabase
    const loadAlerts = async () => {
      setLoading(true);
      
      // Simulation d'alertes pour démonstration
      const mockAlerts: SecurityAlert[] = [];
      
      if (transactionId) {
        // Alertes spécifiques à la transaction
        mockAlerts.push({
          id: '1',
          type: 'unusual_pattern',
          severity: 'medium',
          description: 'Montant de transaction supérieur à la moyenne',
          timestamp: new Date().toISOString(),
          transactionId,
          resolved: false
        });
      }

      if (userId) {
        // Alertes spécifiques à l'utilisateur
        mockAlerts.push({
          id: '2',
          type: 'rate_limit_exceeded',
          severity: 'high',
          description: 'Tentatives de paiement fréquentes détectées',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          userId,
          resolved: false
        });
      }

      setAlerts(mockAlerts);
      setLoading(false);
    };

    loadAlerts();
  }, [transactionId, userId]);

  if (loading) {
    return (
      <Card className={cn("border-gray-200", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Vérifications de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-green-800">
            <Shield className="h-4 w-4" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700">
            ✅ Aucune alerte de sécurité détectée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-orange-200 bg-orange-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          Alertes de Sécurité ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          
          return (
            <Alert key={alert.id} className={cn("border-2", config.color)}>
              <div className="flex items-start gap-3">
                <Icon className={cn("h-4 w-4 mt-0.5", config.iconColor)} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("text-xs", config.color)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs opacity-75">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <AlertDescription className="text-sm">
                    {alert.description}
                  </AlertDescription>
                  {alert.transactionId && (
                    <p className="text-xs opacity-75">
                      Transaction: {alert.transactionId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SecurityAlertsDisplay;
