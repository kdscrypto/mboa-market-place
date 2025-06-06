
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";

export const useNotificationSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('messaging_sound_enabled');
    const savedNotificationsEnabled = localStorage.getItem('messaging_notifications_enabled');
    
    if (savedSoundEnabled !== null) {
      setSoundEnabled(JSON.parse(savedSoundEnabled));
    }
    
    if (savedNotificationsEnabled !== null) {
      setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
    }
  }, []);

  // Request notification permission when notifications are enabled
  useEffect(() => {
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'denied') {
            setNotificationsEnabled(false);
            localStorage.setItem('messaging_notifications_enabled', 'false');
            toast.error("Permissions de notification refusées");
          }
        });
      } else if (Notification.permission === 'denied') {
        setNotificationsEnabled(false);
        localStorage.setItem('messaging_notifications_enabled', 'false');
      }
    }
  }, [notificationsEnabled]);

  const toggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('messaging_sound_enabled', JSON.stringify(enabled));
  }, []);

  const toggleNotifications = useCallback((enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('messaging_notifications_enabled', JSON.stringify(enabled));
    
    if (enabled) {
      toast.success("Notifications activées");
    } else {
      toast.info("Notifications désactivées");
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create a simple notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log("Could not play notification sound:", error);
      }
    }
  }, [soundEnabled]);

  const showDesktopNotification = useCallback((title: string, body: string, icon?: string) => {
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'messaging-notification'
        });
      }
    }
  }, [notificationsEnabled]);

  return {
    soundEnabled,
    notificationsEnabled,
    toggleSound,
    toggleNotifications,
    playNotificationSound,
    showDesktopNotification
  };
};
