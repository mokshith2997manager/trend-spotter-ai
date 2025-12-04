import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { XPBar } from '@/components/XPBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { AchievementBadges } from '@/components/AchievementBadges';
import { NotificationSettings } from '@/components/NotificationSettings';
import { 
  LogOut, 
  Settings, 
  Bookmark, 
  Trophy, 
  Zap,
  Calendar,
  Star,
  Play,
  Gift,
  Edit
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user, profile, loading, signOut, addXP } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ bets: 0, bookmarks: 0 });
  const [watchingAd, setWatchingAd] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchStats();
    }
  }, [user, loading]);

  const fetchStats = async () => {
    if (!user) return;

    const [betsResult, bookmarksResult] = await Promise.all([
      supabase
        .from('actions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('type', 'bet'),
      supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
    ]);

    setStats({
      bets: betsResult.count || 0,
      bookmarks: bookmarksResult.count || 0
    });
  };

  const handleWatchAd = async () => {
    setWatchingAd(true);
    try {
      const { prepareRewardedAd, showRewardedAd } = await import('@/admob');
      await prepareRewardedAd();
      const reward = await showRewardedAd();
      if (reward) {
        // Give bonus XP for watching ad
        await addXP(25, 'watch_ad');
      }
    } catch (error) {
      console.log('Ad not available in web preview');
      // For web preview, simulate reward
      await addXP(25, 'watch_ad');
    } finally {
      setWatchingAd(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLevel = (xp: number) => Math.floor(xp / 100) + 1;
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Profile Header */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-muted">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {profile.display_name || 'Trend Hunter'}
                </h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Star className="w-3 h-3 mr-1" />
                    Level {getLevel(profile.xp)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {memberSince}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <XPBar xp={profile.xp} />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{profile.xp}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold">{stats.bets}</p>
              <p className="text-xs text-muted-foreground">Bets Placed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 text-center">
              <Bookmark className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">{stats.bookmarks}</p>
              <p className="text-xs text-muted-foreground">Bookmarks</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    className="bg-gradient-hype text-white"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watch Ad for XP */}
        <Card className="bg-gradient-card border-primary/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn Bonus XP</h3>
                  <p className="text-sm text-muted-foreground">Watch a video ad to earn +25 XP</p>
                </div>
              </div>
              <Button 
                onClick={handleWatchAd}
                disabled={watchingAd}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {watchingAd ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/onboarding')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Update Interests
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}