
import React from 'react';
import { useMobileUserPreferences } from '@/hooks/useMobileUserPreferences';
import { useAdvancedMobileDetection } from '@/hooks/useAdvancedMobileDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Eye, 
  Palette, 
  Type, 
  Zap, 
  Wifi, 
  Layout, 
  Accessibility,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

interface MobileUserPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileUserPreferencesPanel: React.FC<MobileUserPreferencesPanelProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { 
    preferences, 
    updatePreference, 
    resetToDefaults, 
    getOptimalSettings,
    isPreferenceSupported 
  } = useMobileUserPreferences();
  
  const { deviceType, performanceLevel, connectionType } = useAdvancedMobileDetection();

  if (!isOpen) return null;

  const applyOptimalSettings = () => {
    const optimal = getOptimalSettings();
    Object.entries(optimal).forEach(([key, value]) => {
      updatePreference(key as keyof typeof optimal, value);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
      <div className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-lg overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Préférences Mobile
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Device Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Informations de l'appareil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Type d'appareil:</span>
                <Badge variant="outline">{deviceType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Performance:</span>
                <Badge variant={performanceLevel === 'low' ? 'destructive' : 'default'}>
                  {performanceLevel}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Connexion:</span>
                <Badge variant={connectionType?.includes('2g') ? 'destructive' : 'default'}>
                  {connectionType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={applyOptimalSettings} 
                className="w-full"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Appliquer les paramètres optimaux
              </Button>
              <Button 
                onClick={resetToDefaults} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser aux valeurs par défaut
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Thème</label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => updatePreference('theme', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Taille de police</label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={(value) => updatePreference('fontSize', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petite</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contraste élevé</label>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Animations réduites</label>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Layout className="h-4 w-4 mr-2" />
                Mise en page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode compact</label>
                <Switch
                  checked={preferences.layout.compactMode}
                  onCheckedChange={(checked) => 
                    updatePreference('layout', { compactMode: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Colonnes de grille: {preferences.layout.gridColumns}
                </label>
                <Slider
                  value={[preferences.layout.gridColumns]}
                  onValueChange={([value]) => 
                    updatePreference('layout', { gridColumns: value })
                  }
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Afficher les images</label>
                <Switch
                  checked={preferences.layout.showImages}
                  onCheckedChange={(checked) => 
                    updatePreference('layout', { showImages: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Données et performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mode économie de données</label>
                <Switch
                  checked={preferences.dataSaver}
                  onCheckedChange={(checked) => updatePreference('dataSaver', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Accessibility className="h-4 w-4 mr-2" />
                Accessibilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Cibles tactiles agrandies</label>
                <Switch
                  checked={preferences.accessibility.largeTouchTargets}
                  onCheckedChange={(checked) => 
                    updatePreference('accessibility', { largeTouchTargets: checked })
                  }
                />
              </div>

              {isPreferenceSupported('voiceOver') && (
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">VoiceOver</label>
                  <Switch
                    checked={preferences.accessibility.voiceOver}
                    onCheckedChange={(checked) => 
                      updatePreference('accessibility', { voiceOver: checked })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          {isPreferenceSupported('notifications') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Notifications activées</label>
                  <Switch
                    checked={preferences.notifications.enabled}
                    onCheckedChange={(checked) => 
                      updatePreference('notifications', { enabled: checked })
                    }
                  />
                </div>

                {preferences.notifications.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Son</label>
                      <Switch
                        checked={preferences.notifications.sound}
                        onCheckedChange={(checked) => 
                          updatePreference('notifications', { sound: checked })
                        }
                      />
                    </div>

                    {isPreferenceSupported('vibration') && (
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Vibration</label>
                        <Switch
                          checked={preferences.notifications.vibration}
                          onCheckedChange={(checked) => 
                            updatePreference('notifications', { vibration: checked })
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="h-8" /> {/* Bottom spacing */}
        </div>
      </div>
    </div>
  );
};

export default MobileUserPreferencesPanel;
