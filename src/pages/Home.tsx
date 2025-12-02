import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trend } from '@/types/database';
import { TrendCard } from '@/components/TrendCard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles, TrendingUp, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'all' | 'hot' | 'rising' | 'new';

export default function Home() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTrends();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('trends-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trends' },
        () => {
          fetchTrends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchTrends = async () => {
    let query = supabase
      .from('trends')
      .select('*')
      .order('score', { ascending: false });

    if (filter === 'hot') {
      query = query.gte('score', 70);
    } else if (filter === 'rising') {
      query = query.gte('score', 50).lt('score', 70);
    } else if (filter === 'new') {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error('Error fetching trends:', error);
    } else {
      setTrends(data as Trend[]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast({ title: "Refreshing trends...", description: "This may take a moment" });
    
    try {
      const response = await supabase.functions.invoke('generate-trends');
      if (response.error) throw response.error;
      
      await fetchTrends();
      toast({ title: "Trends updated!", description: `Found ${response.data?.processed || 0} trends` });
    } catch (error) {
      console.error('Error refreshing:', error);
      toast({ 
        title: "Refresh failed", 
        description: "Try again later",
        variant: "destructive" 
      });
    }
    
    setRefreshing(false);
  };

  const filterButtons: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" /> },
    { type: 'hot', label: 'Hot', icon: <Flame className="w-4 h-4" /> },
    { type: 'rising', label: 'Rising', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header xp={profile?.xp || 0} showXP={!!profile} />
      
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <Button
              key={btn.type}
              variant={filter === btn.type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(btn.type)}
              className={filter === btn.type ? "bg-gradient-hype" : ""}
            >
              {btn.icon}
              <span className="ml-1">{btn.label}</span>
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Trends list */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No trends yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Click refresh to discover trending topics
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Discover Trends
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trends.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onClick={() => navigate(`/trend/${trend.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}