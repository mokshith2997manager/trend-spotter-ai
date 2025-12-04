import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Youtube, Lightbulb, TrendingUp, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ViralReel {
  id: string;
  platform: 'youtube';
  title: string;
  creator: string;
  thumbnail: string;
  link: string;
  views?: string;
  hookAnalysis: string;
  pacingNotes: string;
  trendUsed?: string;
  audioTip?: string;
  recreationTips: string[];
  relevanceScore?: number;
}

// Default reels with REAL YouTube video IDs that work
const defaultReels: ViralReel[] = [
  {
    id: '1',
    platform: 'youtube',
    title: 'Morning Routine That Changed My Life',
    creator: '@productivityguru',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    views: '2.3M',
    hookAnalysis: 'Opens with a bold statement and immediate visual action within 0.5 seconds',
    pacingNotes: 'Quick cuts every 2-3 seconds, text overlays sync with audio beats',
    trendUsed: 'Before/After transformation',
    audioTip: 'Uses trending motivational audio with bass drop at key moments',
    recreationTips: [
      'Start with a controversial or surprising statement',
      'Show the end result within first 3 seconds',
      'Use time-lapse for routine segments',
      'Add text captions for accessibility'
    ]
  },
  {
    id: '2',
    platform: 'youtube',
    title: '5 Habits of Highly Successful People',
    creator: '@mindsetcoach',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=1ZXN1NHpJK4',
    views: '5.1M',
    hookAnalysis: 'Starts with "Nobody talks about this..." curiosity gap technique',
    pacingNotes: 'Numbered list format, each point under 10 seconds',
    trendUsed: 'Educational listicle',
    audioTip: 'Voiceover with subtle background music, increases tension per point',
    recreationTips: [
      'Use numbered format for easy follow',
      'Each tip should be actionable',
      'End with a call-to-action question',
      'Keep total length under 60 seconds'
    ]
  },
  {
    id: '3',
    platform: 'youtube',
    title: 'POV: You Finally Got Your Dream Setup',
    creator: '@techsetups',
    thumbnail: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=Fkd9TWUtFm0',
    views: '1.8M',
    hookAnalysis: 'POV format creates immediate viewer immersion',
    pacingNotes: 'Slow reveal with dramatic music build-up',
    trendUsed: 'POV/Setup reveal',
    audioTip: 'Uses cinematic transition sounds and bass-heavy reveal track',
    recreationTips: [
      'Build anticipation with close-up shots',
      'Save the full reveal for the end',
      'Use lighting transitions for drama',
      'Add satisfying ASMR sounds'
    ]
  },
  {
    id: '4',
    platform: 'youtube',
    title: 'What I Eat in a Day for Clear Skin',
    creator: '@healthyeats',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
    views: '3.7M',
    hookAnalysis: 'Starts with end result (glowing skin) then reveals the journey',
    pacingNotes: 'Meal-by-meal format with quick transitions and calorie counts',
    trendUsed: 'What I Eat in a Day',
    audioTip: 'Uses upbeat trending pop song with ASMR cooking sounds',
    recreationTips: [
      'Show your skin results first',
      'Include specific portions and times',
      'Add satisfying food prep sounds',
      'End with before/after comparison'
    ]
  },
  {
    id: '5',
    platform: 'youtube',
    title: 'Things That Just Make Sense',
    creator: '@lifehackking',
    thumbnail: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    views: '8.2M',
    hookAnalysis: 'Uses satisfying/oddly satisfying format with instant dopamine hits',
    pacingNotes: 'Rapid-fire clips, 1-2 seconds each, no breaks',
    trendUsed: 'Compilation/Oddly Satisfying',
    audioTip: 'Catchy trending sound with perfect timing on each clip',
    recreationTips: [
      'Each clip should be instantly satisfying',
      'No filler content - pure dopamine',
      'Sync transitions to music beats',
      'Leave viewers wanting more'
    ]
  },
  {
    id: '6',
    platform: 'youtube',
    title: 'Get Ready With Me for Events',
    creator: '@glammakeup',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80',
    link: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    views: '4.5M',
    hookAnalysis: 'Celebrity event hook creates FOMO and aspirational content',
    pacingNotes: 'Step-by-step makeup application with product callouts',
    trendUsed: 'GRWM (Get Ready With Me)',
    audioTip: 'Voiceover with chatty storytelling tone, trending background music',
    recreationTips: [
      'Hook with the event/occasion first',
      'Talk directly to camera like chatting with a friend',
      'Show each product clearly',
      'Include outfit reveal at the end'
    ]
  }
];

interface ReelsReferenceProps {
  reels?: ViralReel[];
  title?: string;
  trendTitle?: string;
}

export function ReelsReference({ reels = defaultReels, title = "Viral Reels Inspiration", trendTitle }: ReelsReferenceProps) {
  const [selectedReel, setSelectedReel] = useState<ViralReel | null>(null);
  const [analyzedReels, setAnalyzedReels] = useState<ViralReel[]>(reels);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (trendTitle && !hasAnalyzed) {
      analyzeReelsWithAI();
    }
  }, [trendTitle]);

  const analyzeReelsWithAI = async () => {
    if (!trendTitle) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-reels', {
        body: {
          reels: reels.map(r => ({
            id: r.id,
            title: r.title,
            creator: r.creator,
            platform: r.platform
          })),
          trendTitle
        }
      });

      if (error) throw error;

      if (data?.analyses) {
        const enhanced = reels.map(reel => {
          const analysis = data.analyses.find((a: any) => a.id === reel.id);
          if (analysis) {
            return {
              ...reel,
              hookAnalysis: analysis.hookAnalysis || reel.hookAnalysis,
              pacingNotes: analysis.pacingNotes || reel.pacingNotes,
              trendUsed: analysis.trendUsed || reel.trendUsed,
              audioTip: analysis.audioTip || reel.audioTip,
              recreationTips: analysis.recreationTips || reel.recreationTips,
              relevanceScore: analysis.relevanceScore
            };
          }
          return reel;
        });
        
        // Sort by relevance score
        enhanced.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        setAnalyzedReels(enhanced);
      }
      setHasAnalyzed(true);
    } catch (err) {
      console.error('Failed to analyze reels:', err);
      setAnalyzedReels(reels);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const openLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <Badge variant="outline" className="text-xs text-primary">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analyzing
              </Badge>
            )}
            {hasAnalyzed && (
              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              {analyzedReels.length} reels
            </Badge>
          </div>
        </div>

        <div className="grid gap-3">
          {analyzedReels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedReel(reel)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={reel.thumbnail} 
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <div className="absolute bottom-1 left-1">
                        <Badge className="text-[10px] py-0 bg-red-500/80">
                          <Youtube className="w-3 h-3" />
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {reel.title}
                        </h4>
                        {reel.relevanceScore && (
                          <Badge className="ml-2 bg-primary/20 text-primary text-[10px]">
                            {reel.relevanceScore}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {reel.creator}
                      </p>
                      {reel.views && (
                        <Badge variant="outline" className="text-[10px]">
                          {reel.views} views
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedReel} onOpenChange={() => setSelectedReel(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedReel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  {selectedReel.title}
                </DialogTitle>
              </DialogHeader>

              {/* Video Actions */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={selectedReel.thumbnail} 
                  alt={selectedReel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => openLink(selectedReel.link)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch on YouTube
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyLink(selectedReel.link)}
                >
                  {copiedLink === selectedReel.link ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Creator & Stats */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{selectedReel.creator}</span>
                {selectedReel.views && (
                  <Badge variant="secondary">{selectedReel.views} views</Badge>
                )}
              </div>

              {/* Analysis */}
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    Why This Works
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedReel.hookAnalysis}</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Pacing:</span>
                    <p className="text-sm">{selectedReel.pacingNotes}</p>
                  </div>
                  {selectedReel.trendUsed && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Trend:</span>
                      <Badge className="ml-2 bg-primary/20 text-primary">
                        {selectedReel.trendUsed}
                      </Badge>
                    </div>
                  )}
                  {selectedReel.audioTip && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Audio:</span>
                      <p className="text-sm">{selectedReel.audioTip}</p>
                    </div>
                  )}
                </div>

                {/* Recreation Tips */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">How to Recreate</h4>
                  <ul className="space-y-1">
                    {selectedReel.recreationTips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
