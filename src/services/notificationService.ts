import { supabase } from '@/integrations/supabase/client';

export class NotificationService {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      return Notification.requestPermission();
    }

    return 'denied';
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<Notification | null> {
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        tag: 'hypelens-notification',
        ...options,
      });

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  static async sendTrendAlert(
    trendTitle: string,
    currentScore: number,
    previousScore: number,
    trendId: string
  ): Promise<void> {
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) return;

      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('trend_alerts_enabled, trend_alert_threshold')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!preferences?.trend_alerts_enabled || currentScore < (preferences?.trend_alert_threshold || 70)) {
        return;
      }

      await this.showNotification(`${trendTitle} is trending!`, {
        body: `Score jumped from ${previousScore} to ${currentScore}`,
        tag: `trend-${trendId}`,
        requireInteraction: false,
      });

      const { data: { publicUrl } } = supabase.storage.from('public').getPublicUrl('');
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-trend-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          trend_id: trendId,
          trend_title: trendTitle,
          current_score: currentScore,
          previous_score: previousScore,
        }),
      }).catch(err => console.error('Failed to trigger notification function:', err));
    } catch (error) {
      console.error('Error sending trend alert:', error);
    }
  }

  static async saveFCMToken(userId: string, token: string): Promise<void> {
    try {
      await supabase
        .from('notification_preferences')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}