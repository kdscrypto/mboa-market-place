
import React from "react";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedNotificationsProps {
  unreadCount: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onToggleNotifications: (enabled: boolean) => void;
}

const EnhancedNotifications: React.FC<EnhancedNotificationsProps> = ({
  unreadCount,
  soundEnabled,
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-mboa-orange">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-mboa-orange" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">Notifications push</span>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={onToggleNotifications}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-mboa-orange" />
            ) : (
              <VolumeX className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">Sons des notifications</span>
          </div>
          <Switch
            checked={soundEnabled}
            onCheckedChange={onToggleSound}
            disabled={!notificationsEnabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNotifications;
