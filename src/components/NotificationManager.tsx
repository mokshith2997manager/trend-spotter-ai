import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const DAILY_REWARD_CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour
const TRENDING_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // Check every 4 hours

export function NotificationManager() {
  const { profile } = useAuth();
  const { 
    permission, 
    preferences, 
    showDailyRewardNotification,
    showTrendingNotification 
  } = useNotifications();
  
  const lastDailyNotification = useRef<number>(0);
  const lastTrendingNotification = useRef<number>(0);

  useEffect(() => {
    if (permission !== 'granted' || !preferences.notifications_enabled) {
      return;
    }

    // Check for daily reward availability
    const checkDailyReward = () => {
      if (!profile || !preferences.notify_daily_rewards) return;

      const now = Date.now();
      const lastReward = profile.last_daily_reward_at 
        ? new Date(profile.last_daily_reward_at).getTime() 
        : 0;
      
      const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
      const hoursSinceLastNotification = (now - lastDailyNotification.current) / (1000 * 60 * 60);

      // Show notification if reward is available and we haven't notified in the last 6 hours
      if (hoursSinceLastReward >= 24 && hoursSinceLastNotification >= 6) {
        showDailyRewardNotification();
        lastDailyNotification.current = now;
      }
    };

    // Check for new trending topics (simulated - in production would check against stored trends)
    const checkTrending = () => {
      if (!preferences.notify_trending) return;

      const now = Date.now();
      const hoursSinceLastNotification = (now - lastTrendingNotification.current) / (1000 * 60 * 60);

      // Only notify once every 8 hours minimum
      if (hoursSinceLastNotification >= 8) {
        // In production, you would check against actual new trends
        // For now, we'll skip the trending notification to avoid spam
        // showTrendingNotification('Example Trend');
        lastTrendingNotification.current = now;
      }
    };

    // Initial checks
    const initialTimeout = setTimeout(() => {
      checkDailyReward();
    }, 5000); // Check 5 seconds after mount

    // Set up intervals
    const dailyInterval = setInterval(checkDailyReward, DAILY_REWARD_CHECK_INTERVAL);
    const trendingInterval = setInterval(checkTrending, TRENDING_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(dailyInterval);
      clearInterval(trendingInterval);
    };
  }, [
    permission, 
    preferences, 
    profile, 
    showDailyRewardNotification, 
    showTrendingNotification
  ]);

  // This component doesn't render anything
  return null;
}