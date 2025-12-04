import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Flame, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BASE_XP = 10;
const STREAK_BONUS = 5;
const MAX_STREAK_BONUS = 50;

export function DailyReward() {
  const { user, profile, addXP } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    checkDailyReward();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const checkDailyReward = () => {
    if (!profile) return;
    
    const lastReward = profile.last_daily_reward_at 
      ? new Date(profile.last_daily_reward_at) 
      : null;
    
    setStreak(profile.daily_streak || 0);

    if (!lastReward) {
      setCanClaim(true);
      return;
    }

    const now = new Date();
    const lastRewardDate = new Date(lastReward);
    
    // Check if 24 hours have passed
    const hoursSinceLastReward = (now.getTime() - lastRewardDate.getTime()) / (1000 * 60 * 60);
    setCanClaim(hoursSinceLastReward >= 24);
  };

  const updateCountdown = () => {
    if (!profile?.last_daily_reward_at) {
      setTimeUntilReset('');
      return;
    }

    const lastReward = new Date(profile.last_daily_reward_at);
    const nextReward = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextReward) {
      setCanClaim(true);
      setTimeUntilReset('');
      return;
    }

    const diff = nextReward.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
  };

  const claimReward = async () => {
    if (!user || !canClaim || claiming) return;
    
    setClaiming(true);
    
    try {
      const lastReward = profile?.last_daily_reward_at 
        ? new Date(profile.last_daily_reward_at) 
        : null;
      
      let newStreak = 1;
      
      if (lastReward) {
        const hoursSinceLastReward = (Date.now() - lastReward.getTime()) / (1000 * 60 * 60);
        // If claimed within 48 hours, increment streak; otherwise reset
        if (hoursSinceLastReward < 48) {
          newStreak = (profile?.daily_streak || 0) + 1;
        }
      }

      // Calculate XP with streak bonus
      const streakBonus = Math.min((newStreak - 1) * STREAK_BONUS, MAX_STREAK_BONUS);
      const totalXP = BASE_XP + streakBonus;

      // Update profile with new streak and last reward time
      const { error } = await supabase
        .from('profiles')
        .update({ 
          last_daily_reward_at: new Date().toISOString(),
          daily_streak: newStreak
        })
        .eq('id', user.id);

      if (error) throw error;

      // Add XP
      await addXP(totalXP, 'daily_reward');
      
      setStreak(newStreak);
      setCanClaim(false);
      
      toast.success(`+${totalXP} XP claimed!`, {
        description: newStreak > 1 ? `🔥 ${newStreak} day streak!` : 'Come back tomorrow for more!'
      });
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const currentRewardXP = BASE_XP + Math.min(streak * STREAK_BONUS, MAX_STREAK_BONUS);

  return (
    <Card className="bg-gradient-card border-primary/30 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              canClaim ? 'bg-primary/20 animate-pulse' : 'bg-muted'
            }`}>
              <Gift className={`w-6 h-6 ${canClaim ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Daily Reward
                {streak > 0 && (
                  <span className="flex items-center text-orange-400 text-sm">
                    <Flame className="w-4 h-4 mr-0.5" />
                    {streak}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {canClaim 
                  ? `Claim +${currentRewardXP} XP today!` 
                  : timeUntilReset 
                    ? `Next reward in ${timeUntilReset}`
                    : 'Loading...'
                }
              </p>
            </div>
          </div>
          <Button 
            onClick={claimReward}
            disabled={!canClaim || claiming}
            className={canClaim 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-muted text-muted-foreground'
            }
          >
            {claiming ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : canClaim ? (
              'Claim'
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}