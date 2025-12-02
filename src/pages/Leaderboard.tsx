import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/database';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setLeaders(data as Profile[]);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "bg-card border-border/50";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLevel = (xp: number) => Math.floor(xp / 100) + 1;

  // Find current user's rank
  const userRank = user ? leaders.findIndex(l => l.id === user.id) + 1 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header xp={profile?.xp || 0} showXP={!!profile} />
      
      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          {userRank > 0 && (
            <Badge variant="outline" className="text-primary border-primary">
              Your Rank: #{userRank}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No leaders yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to earn XP!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = user?.id === leader.id;
              
              return (
                <Card 
                  key={leader.id}
                  className={cn(
                    "transition-all duration-200",
                    getRankStyle(rank),
                    isCurrentUser && "ring-2 ring-primary"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(rank)}
                      </div>
                      
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={leader.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-sm">
                          {getInitials(leader.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-semibold truncate",
                          isCurrentUser && "text-primary"
                        )}>
                          {leader.display_name || 'Anonymous'}
                          {isCurrentUser && " (You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {getLevel(leader.xp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-right">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold">{leader.xp.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {leader.badges && leader.badges.length > 0 && (
                      <div className="flex gap-1 mt-2 ml-11">
                        {leader.badges.slice(0, 3).map((badge, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-xs py-0"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}