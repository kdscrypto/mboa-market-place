
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import GeneralSettingsCard from './settings/GeneralSettingsCard';
import SecuritySettingsCard from './settings/SecuritySettingsCard';
import SystemStatusCard from './settings/SystemStatusCard';
import MaintenanceActionsCard from './settings/MaintenanceActionsCard';
import MaintenanceModeAlert from './settings/MaintenanceModeAlert';
import SettingsSaveButton from './settings/SettingsSaveButton';
import UserRoleManager from './settings/UserRoleManager';

const SystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // État local pour les paramètres - updated to match component expectations
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    auto_moderation: true,
    email_notifications: true,
    security_alerts: true,
    rate_limiting: true,
    backup_enabled: true
  });

  // Charger les paramètres système (simulé pour le moment)
  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      // Pour le moment, on retourne les paramètres par défaut
      // Dans une vraie implémentation, ceci ferait appel à une table de configuration
      return settings;
    }
  });

  // Mutation pour sauvegarder les paramètres
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      // Simulation d'une sauvegarde
      // Dans une vraie implémentation, ceci sauvegarderait dans une table de configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Succès",
        description: "Les paramètres ont été sauvegardés avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    }
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettingsMutation.mutateAsync(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerte mode maintenance */}
      <MaintenanceModeAlert isMaintenanceMode={settings.maintenance_mode} />

      {/* Grille des paramètres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeneralSettingsCard 
          settings={settings}
          onSettingChange={handleSettingChange}
        />

        <SecuritySettingsCard
          settings={settings}
          onSettingChange={handleSettingChange}
        />

        <SystemStatusCard />

        <MaintenanceActionsCard />

        {/* Nouveau composant pour la gestion des rôles */}
        <div className="lg:col-span-2">
          <UserRoleManager />
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <SettingsSaveButton 
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default SystemSettings;
