import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trend } from '@/types/database';
import { TrendCard } from '@/components/TrendCard';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Fashion', 'Tech', 'Gaming', 'Music', 'Food', 'Fitness', 'Beauty'];

export default function Discover() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrends();
  }, [selectedCategory]);

  const fetchTrends = async () => {
    let query = supabase
      .from('trends')
      .select('*')
      .order('score', { ascending: false });

    const { data, error } = await query.limit(100);
    
    if (error) {
      console.error('Error fetching trends:', error);
    } else {
      setTrends(data as Trend[]);
    }
    setLoading(false);
  };

  const filteredTrends = trends.filter(trend => {
    const matchesSearch = search === '' || 
      trend.title.toLowerCase().includes(search.toLowerCase()) ||
      trend.suggested_tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' ||
      trend.suggested_tags?.some(tag => 
        tag.toLowerCase().includes(selectedCategory.toLowerCase())
      ) ||
      trend.title.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header xp={profile?.xp || 0} showXP={!!profile} />
      
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap",
                selectedCategory === category && "bg-gradient-hype"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-3">
          {filteredTrends.length} trend{filteredTrends.length !== 1 ? 's' : ''} found
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filteredTrends.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No trends found</h3>
            <p className="text-muted-foreground text-sm">
              Try a different search or category
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrends.map((trend) => (
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