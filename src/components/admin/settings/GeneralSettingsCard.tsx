
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface GeneralSettingsCardProps {
  settings: {
    maintenance_mode: boolean;
    auto_moderation: boolean;
    email_notifications: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
}

const GeneralSettingsCard = ({ settings, onSettingChange }: GeneralSettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Généraux</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mode maintenance</h4>
              <p className="text-sm text-gray-600">Désactiver l'accès public à la plateforme</p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(value) => onSettingChange('maintenance_mode', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Modération automatique</h4>
              <p className="text-sm text-gray-600">Filtrage automatique du contenu</p>
            </div>
            <Switch
              checked={settings.auto_moderation}
              onCheckedChange={(value) => onSettingChange('auto_moderation', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications email</h4>
              <p className="text-sm text-gray-600">Envoyer des notifications par email</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(value) => onSettingChange('email_notifications', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsCard;
