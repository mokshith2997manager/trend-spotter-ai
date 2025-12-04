import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  notifications_enabled: boolean;
  notify_daily_rewards: boolean;
  notify_trending: boolean;
}

export function useNotifications() {
  const { user, profile } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notifications_enabled: true,
    notify_daily_rewards: true,
    notify_trending: true
  });

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setPreferences({
        notifications_enabled: profile.notifications_enabled ?? true,
        notify_daily_rewards: profile.notify_daily_rewards ?? true,
        notify_trending: profile.notify_trending ?? true
      });
    }
  }, [profile]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw-push.js');
          } catch (err) {
            console.error('Service worker registration failed:', err);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  }, [isSupported]);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
  }, [user, preferences]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted' || !preferences.notifications_enabled) {
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (err) {
      console.error('Failed to show notification:', err);
    }
  }, [isSupported, permission, preferences.notifications_enabled]);

  const showDailyRewardNotification = useCallback(() => {
    if (!preferences.notify_daily_rewards) return;
    
    showNotification('🎁 Daily Reward Available!', {
      body: 'Claim your daily XP bonus now!',
      tag: 'daily-reward',
      data: { url: '/profile' }
    });
  }, [showNotification, preferences.notify_daily_rewards]);

  const showTrendingNotification = useCallback((trendTitle: string) => {
    if (!preferences.notify_trending) return;
    
    showNotification('🔥 New Trending Topic!', {
      body: `"${trendTitle}" is trending now. Check it out!`,
      tag: 'trending',
      data: { url: '/discover' }
    });
  }, [showNotification, preferences.notify_trending]);

  return {
    isSupported,
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    showNotification,
    showDailyRewardNotification,
    showTrendingNotification
  };
}