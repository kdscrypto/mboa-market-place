
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  X, 
  Eye,
  Bell,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

interface RealTimeAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  source_identifier: string;
  risk_score: number;
  created_at: string;
}

const RealTimeSecurityAlerts: React.FC = () => {
  const [activeAlerts, setActiveAlerts] = useState<RealTimeAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const { toast } = useToast();
  const { resolveAlert } = useAdvancedSecurity();

  useEffect(() => {
    // Subscribe to real-time security alerts
    const channel = supabase
      .channel('security-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts',
          filter: 'severity=in.(high,critical)'
        },
        (payload) => {
          const newAlert = payload.new as RealTimeAlert;
          
          // Add to active alerts if not dismissed
          if (!dismissedAlerts.includes(newAlert.id)) {
            setActiveAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep only 5 most recent
            
            // Show toast notification
            toast({
              title: `🚨 ${newAlert.severity === 'critical' ? 'Alerte Critique' : 'Alerte Haute Priorité'}`,
              description: newAlert.title,
              variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
              duration: newAlert.severity === 'critical' ? 0 : 8000, // Critical alerts don't auto-dismiss
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          const updatedAlert = payload.new as RealTimeAlert;
          
          // Remove resolved alerts from active list
          if (updatedAlert.status !== 'active') {
            setActiveAlerts(prev => prev.filter(alert => alert.id !== updatedAlert.id));
          }
        }
      )
      .subscribe();

    // Load initial critical alerts
    const loadInitialAlerts = async () => {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('status', 'active')
        .in('severity', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setActiveAlerts(data);
      }
    };

    loadInitialAlerts();

    return () => {
      channel.unsubscribe();
    };
  }, [dismissedAlerts, toast]);

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleResolveAlert = async (alertId: string, action: 'investigating' | 'resolved') => {
    try {
      await resolveAlert(alertId, action);
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Alerte Traitée",
        description: `L'alerte a été marquée comme ${action === 'resolved' ? 'résolue' : 'en cours d\'investigation'}`,
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    ) : (
      <Shield className="h-4 w-4 text-orange-600" />
    );
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {activeAlerts.map((alert) => (
        <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} border-l-4 shadow-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    className={alert.severity === 'critical' ? 'bg-red-600' : 'bg-orange-600'}
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.created_at).toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                
                <AlertDescription className="text-sm font-medium mb-2">
                  {alert.title}
                </AlertDescription>
                
                {alert.description && (
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                )}
                
                <div className="text-xs text-gray-500 mb-3">
                  Source: {alert.source_identifier} • Score: {alert.risk_score}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id, 'investigating')}
                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Investiguer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id, 'resolved')}
                    className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                  >
                    Résoudre
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismissAlert(alert.id)}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      ))}
      
      {activeAlerts.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveAlerts([])}
            className="text-xs"
          >
            <Bell className="h-3 w-3 mr-1" />
            Tout masquer
          </Button>
        </div>
      )}
    </div>
  );
};

export default RealTimeSecurityAlerts;
