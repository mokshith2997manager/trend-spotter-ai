import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  Zap, 
  BookMarked, 
  Crown, 
  Rocket,
  Eye,
  Award
} from 'lucide-react';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: string;
  check: (stats: UserStats) => boolean;
  color: string;
}

interface UserStats {
  xp: number;
  bets: number;
  bookmarks: number;
  dailyStreak: number;
  trendsViewed: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first action',
    icon: <Rocket className="w-5 h-5" />,
    requirement: '1 action',
    check: (stats) => stats.bets > 0 || stats.bookmarks > 0,
    color: 'bg-blue-500'
  },
  {
    id: 'trend_spotter',
    name: 'Trend Spotter',
    description: 'View 10 trends',
    icon: <Eye className="w-5 h-5" />,
    requirement: '10 trends viewed',
    check: (stats) => stats.trendsViewed >= 10,
    color: 'bg-purple-500'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Bookmark 5 trends',
    icon: <BookMarked className="w-5 h-5" />,
    requirement: '5 bookmarks',
    check: (stats) => stats.bookmarks >= 5,
    color: 'bg-green-500'
  },
  {
    id: 'predictor',
    name: 'Predictor',
    description: 'Place 10 bets on trends',
    icon: <Target className="w-5 h-5" />,
    requirement: '10 bets',
    check: (stats) => stats.bets >= 10,
    color: 'bg-orange-500'
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day login streak',
    icon: <Flame className="w-5 h-5" />,
    requirement: '3-day streak',
    check: (stats) => stats.dailyStreak >= 3,
    color: 'bg-red-500'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day login streak',
    icon: <Star className="w-5 h-5" />,
    requirement: '7-day streak',
    check: (stats) => stats.dailyStreak >= 7,
    color: 'bg-yellow-500'
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reach 100 XP',
    icon: <Zap className="w-5 h-5" />,
    requirement: '100 XP',
    check: (stats) => stats.xp >= 100,
    color: 'bg-cyan-500'
  },
  {
    id: 'trendsetter',
    name: 'Trendsetter',
    description: 'Reach 500 XP',
    icon: <Trophy className="w-5 h-5" />,
    requirement: '500 XP',
    check: (stats) => stats.xp >= 500,
    color: 'bg-primary'
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Reach 1000 XP',
    icon: <Crown className="w-5 h-5" />,
    requirement: '1000 XP',
    check: (stats) => stats.xp >= 1000,
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Unlock all other badges',
    icon: <Award className="w-5 h-5" />,
    requirement: 'All badges',
    check: () => false,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  }
];

export function AchievementBadges() {
  const { user, profile, updateProfile } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    bets: 0,
    bookmarks: 0,
    dailyStreak: 0,
    trendsViewed: 0
  });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  useEffect(() => {
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile]);

  const fetchStats = async () => {
    if (!user) return;

    const [betsResult, bookmarksResult, viewsResult] = await Promise.all([
      supabase
        .from('actions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('type', 'bet'),
      supabase
        .from('bookmarks')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id),
      supabase
        .from('actions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('type', 'view')
    ]);

    const newStats: UserStats = {
      xp: profile?.xp || 0,
      bets: betsResult.count || 0,
      bookmarks: bookmarksResult.count || 0,
      dailyStreak: profile?.daily_streak || 0,
      trendsViewed: viewsResult.count || 0
    };

    setStats(newStats);
    checkAndAwardBadges(newStats);
  };

  const checkAndAwardBadges = async (currentStats: UserStats) => {
    const currentBadges = profile?.badges || [];
    const newBadges: string[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (badge.id === 'elite') continue;
      
      if (badge.check(currentStats) && !currentBadges.includes(badge.id)) {
        newBadges.push(badge.id);
      }
    }

    const allOtherBadges = BADGE_DEFINITIONS.filter(b => b.id !== 'elite').map(b => b.id);
    const allEarned = allOtherBadges.every(id => 
      currentBadges.includes(id) || newBadges.includes(id)
    );
    if (allEarned && !currentBadges.includes('elite')) {
      newBadges.push('elite');
    }

    if (newBadges.length > 0) {
      const updatedBadges = [...currentBadges, ...newBadges];
      await updateProfile({ badges: updatedBadges });
      
      newBadges.forEach(badgeId => {
        const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (badge) {
          toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
            description: badge.description
          });
        }
      });
    }

    setEarnedBadges([...currentBadges, ...newBadges]);
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {BADGE_DEFINITIONS.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className="relative group cursor-pointer"
                title={`${badge.name}: ${badge.description}`}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isEarned 
                    ? `${badge.color} text-white shadow-lg` 
                    : 'bg-muted/50 text-muted-foreground opacity-40'
                  }
                `}>
                  {badge.icon}
                </div>
                {isEarned && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-lg min-w-[120px]">
                    <p className="font-semibold text-xs">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {badge.requirement}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {earnedBadges.length}/{BADGE_DEFINITIONS.length} badges earned
        </p>
      </CardContent>
    </Card>
  );
}