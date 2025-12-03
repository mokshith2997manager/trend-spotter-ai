import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Instagram, Youtube, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface ViralReel {
  id: string;
  platform: 'instagram' | 'youtube';
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
}

// Mock data - this would come from admin config/backend
const mockReels: ViralReel[] = [
  {
    id: '1',
    platform: 'instagram',
    title: 'Morning Routine That Changed My Life',
    creator: '@fitnessguru',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    link: 'https://instagram.com/reel/example1',
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
    creator: '@productivitypro',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    link: 'https://youtube.com/shorts/example2',
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
    platform: 'instagram',
    title: 'POV: You Finally Got Your Dream Setup',
    creator: '@techsetups',
    thumbnail: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&q=80',
    link: 'https://instagram.com/reel/example3',
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
  }
];

interface ReelsReferenceProps {
  reels?: ViralReel[];
  title?: string;
}

export function ReelsReference({ reels = mockReels, title = "Viral Reels Inspiration" }: ReelsReferenceProps) {
  const [selectedReel, setSelectedReel] = useState<ViralReel | null>(null);

  const PlatformIcon = ({ platform }: { platform: 'instagram' | 'youtube' }) => {
    return platform === 'instagram' 
      ? <Instagram className="w-4 h-4" />
      : <Youtube className="w-4 h-4" />;
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {reels.length} reels
          </Badge>
        </div>

        <div className="grid gap-3">
          {reels.map((reel, index) => (
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
                        <Badge className={cn(
                          "text-[10px] py-0",
                          reel.platform === 'instagram' 
                            ? "bg-pink-500/80" 
                            : "bg-red-500/80"
                        )}>
                          <PlatformIcon platform={reel.platform} />
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {reel.title}
                      </h4>
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
                  <PlatformIcon platform={selectedReel.platform} />
                  {selectedReel.title}
                </DialogTitle>
              </DialogHeader>

              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img 
                  src={selectedReel.thumbnail} 
                  alt={selectedReel.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => window.open(selectedReel.link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Watch
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
