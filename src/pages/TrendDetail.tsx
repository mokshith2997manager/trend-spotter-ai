import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trend } from '@/types/database';
import { ScoreChart } from '@/components/ScoreChart';
import { ReelsReference, ViralReel } from '@/components/ReelsReference';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Zap, 
  Copy, 
  TrendingUp,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock reels related to trends - in production would come from backend
const getTrendReels = (trendTitle: string): ViralReel[] => {
  const baseReels: ViralReel[] = [
    {
      id: `${trendTitle}-1`,
      platform: 'instagram',
      title: `How I Went Viral with ${trendTitle.slice(0, 20)}...`,
      creator: '@contentcreator',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80',
      link: 'https://instagram.com/reel/example',
      views: '1.2M',
      hookAnalysis: 'Strong pattern interrupt in first second with unexpected visual',
      pacingNotes: 'Fast cuts synced to trending audio, builds to satisfying conclusion',
      trendUsed: trendTitle.slice(0, 30),
      audioTip: 'Uses trending sound with recognizable hook',
      recreationTips: [
        'Mirror the opening hook structure',
        'Match the energy level throughout',
        'Use similar transition timing',
        'End with clear call-to-action'
      ]
    },
    {
      id: `${trendTitle}-2`,
      platform: 'youtube',
      title: `${trendTitle} - The TRUTH`,
      creator: '@viralguru',
      thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80',
      link: 'https://youtube.com/shorts/example',
      views: '3.5M',
      hookAnalysis: 'Opens with bold claim that creates curiosity gap',
      pacingNotes: 'Builds tension with quick reveals, uses text overlays for emphasis',
      trendUsed: 'Educational content',
      audioTip: 'Voice-over with subtle suspense music',
      recreationTips: [
        'Lead with your strongest point',
        'Use numbered reveals for structure',
        'Keep each point under 5 seconds',
        'Deliver unexpected twist at end'
      ]
    }
  ];
  return baseReels;
};

export default function TrendDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addXP } = useAuth();
  const { toast } = useToast();
  
  const [trend, setTrend] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasBet, setHasBet] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrend();
      checkBookmark();
      checkBet();
    }
  }, [id, user]);

  const fetchTrend = async () => {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      toast({ title: "Trend not found", variant: "destructive" });
      navigate('/');
      return;
    }
    
    setTrend(data as Trend);
    setLoading(false);
  };

  const checkBookmark = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('trend_id', id)
      .maybeSingle();
    
    setIsBookmarked(!!data);
  };

  const checkBet = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('actions')
      .select('id')
      .eq('user_id', user.id)
      .eq('trend_id', id)
      .eq('type', 'bet')
      .maybeSingle();
    
    setHasBet(!!data);
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('trend_id', id);
      setIsBookmarked(false);
      toast({ title: "Removed from bookmarks" });
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, trend_id: id });
      setIsBookmarked(true);
      await addXP(5, 'bookmark', id);
      toast({ title: "Bookmarked! +5 XP" });
    }
  };

  const handleBet = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (hasBet) {
      toast({ title: "You've already bet on this trend" });
      return;
    }

    await addXP(15, 'bet', id);
    setHasBet(true);
    toast({ 
      title: "Bet placed! +15 XP", 
      description: "You'll earn bonus XP if this trend blows up!" 
    });
  };

  const handleShare = async () => {
    const shareText = `Check out this trending topic: ${trend?.title} - Hype Score: ${trend?.score}/100`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: trend?.title,
          text: shareText,
          url: window.location.href
        });
        if (user) await addXP(5, 'share', id);
        toast({ title: "Shared! +5 XP" });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      if (user) await addXP(5, 'share', id);
      toast({ title: "Copied to clipboard! +5 XP" });
    }
  };

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({ title: "Caption copied!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!trend) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const trendReels = getTrendReels(trend.title);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold ml-2 truncate flex-1">{trend.title}</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Score Hero */}
        <Card className="bg-gradient-card border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hype Score</p>
                <div className={cn("text-5xl font-black", getScoreColor(trend.score))}>
                  {trend.score}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {trend.score >= 80 && <Flame className="w-10 h-10 text-orange-500" />}
                {trend.score >= 60 && trend.score < 80 && <TrendingUp className="w-10 h-10 text-green-400" />}
                <Badge className={cn(
                  "capitalize",
                  trend.confidence_level === 'high' && "bg-green-500/20 text-green-400",
                  trend.confidence_level === 'medium' && "bg-yellow-500/20 text-yellow-400",
                  trend.confidence_level === 'low' && "bg-red-500/20 text-red-400"
                )}>
                  {trend.confidence_level}
                </Badge>
              </div>
            </div>

            {/* Score History Chart */}
            {trend.score_history && Array.isArray(trend.score_history) && trend.score_history.length > 0 && (
              <ScoreChart history={trend.score_history} className="mt-4" />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleBet}
            disabled={hasBet}
            className={cn(
              "flex-1",
              hasBet ? "bg-green-600" : "bg-gradient-hype hover:opacity-90"
            )}
          >
            <Zap className="w-4 h-4 mr-2" />
            {hasBet ? "Bet Placed" : "Bet +15 XP"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleBookmark}
            className={isBookmarked ? "text-yellow-400 border-yellow-400" : ""}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Explanation */}
        {trend.explain && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Why This is Trending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{trend.explain}</p>
            </CardContent>
          </Card>
        )}

        {/* Reels Inspiration */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Viral Reels Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <ReelsReference 
              reels={trendReels} 
              title=""
            />
          </CardContent>
        </Card>

        {/* Social Captions */}
        {trend.examples && trend.examples.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ready-to-Post Captions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trend.examples.map((caption, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg flex items-start justify-between gap-2"
                >
                  <p className="text-sm flex-1">{caption}</p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyCaption(caption)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {trend.suggested_tags && trend.suggested_tags.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Related Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trend.suggested_tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
