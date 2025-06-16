
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Gift, Users, Star, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'new_referral' | 'milestone' | 'reward' | 'level_up';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface AffiliateNotificationSystemProps {
  userId: string;
  onNotificationCount?: (count: number) => void;
}

const AffiliateNotificationSystem: React.FC<AffiliateNotificationSystemProps> = ({ 
  userId, 
  onNotificationCount 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Écouter les nouveaux parrainages en temps réel
    const channel = supabase
      .channel('referral_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'referrals',
          filter: `referrer_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Nouveau parrainage détecté:', payload);
          handleNewReferral(payload.new);
        }
      )
      .subscribe();

    // Écouter les mises à jour de points
    const pointsChannel = supabase
      .channel('points_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'affiliate_points',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Points mis à jour:', payload);
          checkMilestones(payload.new, payload.old);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(pointsChannel);
    };
  }, [userId]);

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    onNotificationCount?.(unreadCount);
  }, [notifications, onNotificationCount]);

  const handleNewReferral = (referralData: any) => {
    const notification: Notification = {
      id: `referral_${referralData.id}`,
      type: 'new_referral',
      title: '🎉 Nouveau parrainage !',
      message: `Vous avez parrainé un nouvel utilisateur de niveau ${referralData.level}. +${referralData.level === 1 ? '2' : '1'} points !`,
      timestamp: new Date(),
      read: false,
      data: referralData
    };

    setNotifications(prev => [notification, ...prev]);
    
    // Notification toast
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000
    });

    // Notification browser si permission accordée
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const checkMilestones = (newData: any, oldData: any) => {
    const milestones = [
      { points: 10, title: "🏆 Premier jalon !", message: "Vous avez atteint 10 points !" },
      { points: 25, title: "⭐ Excellent début !", message: "25 points débloqués !" },
      { points: 50, title: "🎯 Mi-parcours !", message: "50 points atteints !" },
      { points: 100, title: "💎 Centenaire !", message: "100 points ! Vous êtes un pro !" },
      { points: 200, title: "🚀 Super affilié !", message: "200 points ! Extraordinaire !" }
    ];

    milestones.forEach(milestone => {
      if (newData.total_earned >= milestone.points && oldData.total_earned < milestone.points) {
        const notification: Notification = {
          id: `milestone_${milestone.points}`,
          type: 'milestone',
          title: milestone.title,
          message: milestone.message,
          timestamp: new Date(),
          read: false,
          data: { points: milestone.points }
        };

        setNotifications(prev => [notification, ...prev]);
        
        toast({
          title: notification.title,
          description: notification.message,
          duration: 6000
        });
      }
    });

    // Vérifier les jalons de parrainages
    const referralMilestones = [
      { count: 1, title: "🌟 Premier parrainage !", message: "Votre premier filleul s'est inscrit !" },
      { count: 5, title: "👥 Petit réseau !", message: "5 parrainages directs !" },
      { count: 10, title: "🏅 Recruteur confirmé !", message: "10 parrainages directs !" },
      { count: 25, title: "🎖️ Expert en parrainage !", message: "25 parrainages directs !" }
    ];

    referralMilestones.forEach(milestone => {
      if (newData.level_1_referrals >= milestone.count && oldData.level_1_referrals < milestone.count) {
        const notification: Notification = {
          id: `referral_milestone_${milestone.count}`,
          type: 'milestone',
          title: milestone.title,
          message: milestone.message,
          timestamp: new Date(),
          read: false,
          data: { referrals: milestone.count }
        };

        setNotifications(prev => [notification, ...prev]);
      }
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_referral': return Users;
      case 'milestone': return Star;
      case 'reward': return Gift;
      default: return Bell;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden shadow-lg z-50 border">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tout lire
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNotifications(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 mt-0.5 ${
                        notification.type === 'new_referral' ? 'text-blue-500' :
                        notification.type === 'milestone' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AffiliateNotificationSystem;
