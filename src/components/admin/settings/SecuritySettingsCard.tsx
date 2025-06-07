
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface SecuritySettingsCardProps {
  settings: {
    security_alerts: boolean;
    rate_limiting: boolean;
    backup_enabled: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
}

const SecuritySettingsCard = ({ settings, onSettingChange }: SecuritySettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité & Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Alertes de sécurité</h4>
              <p className="text-sm text-gray-600">Notifications des événements critiques</p>
            </div>
            <Switch
              checked={settings.security_alerts}
              onCheckedChange={(value) => onSettingChange('security_alerts', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Limitation de débit</h4>
              <p className="text-sm text-gray-600">Protection contre les attaques DDoS</p>
            </div>
            <Switch
              checked={settings.rate_limiting}
              onCheckedChange={(value) => onSettingChange('rate_limiting', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sauvegardes automatiques</h4>
              <p className="text-sm text-gray-600">Sauvegarde quotidienne des données</p>
            </div>
            <Switch
              checked={settings.backup_enabled}
              onCheckedChange={(value) => onSettingChange('backup_enabled', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsCard;
