
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import MaintenanceModeAlert from './settings/MaintenanceModeAlert';
import SystemStatusCard from './settings/SystemStatusCard';
import GeneralSettingsCard from './settings/GeneralSettingsCard';
import SecuritySettingsCard from './settings/SecuritySettingsCard';
import MaintenanceActionsCard from './settings/MaintenanceActionsCard';
import SettingsSaveButton from './settings/SettingsSaveButton';

const SystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    auto_moderation: true,
    security_alerts: true,
    email_notifications: true,
    rate_limiting: true,
    backup_enabled: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Paramètres sauvegardés",
      description: "Les modifications ont été appliquées avec succès",
    });
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <MaintenanceModeAlert isMaintenanceMode={settings.maintenance_mode} />
      
      <SystemStatusCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralSettingsCard 
          settings={{
            maintenance_mode: settings.maintenance_mode,
            auto_moderation: settings.auto_moderation,
            email_notifications: settings.email_notifications
          }}
          onSettingChange={handleSettingChange}
        />

        <SecuritySettingsCard 
          settings={{
            security_alerts: settings.security_alerts,
            rate_limiting: settings.rate_limiting,
            backup_enabled: settings.backup_enabled
          }}
          onSettingChange={handleSettingChange}
        />
      </div>

      <MaintenanceActionsCard />

      <SettingsSaveButton 
        onSave={handleSaveSettings}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SystemSettings;
