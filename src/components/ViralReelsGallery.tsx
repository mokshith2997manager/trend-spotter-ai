import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ViralReel } from '@/types/database';
import { Play, ExternalLink, Instagram, Youtube, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ViralReelsGallery() {
  const [reels, setReels] = useState<ViralReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState<ViralReel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-viral-reels`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            platform: 'both',
            limit: 6
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }

      const data = await response.json();
      setReels(data.data || []);
    } catch (error) {
      console.error('Error fetching viral reels:', error);
      toast({
        title: 'Error',
        description: 'Could not load viral reels',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const PlatformIcon = ({ platform }: { platform: 'instagram' | 'youtube' }) => {
    return platform === 'instagram'
      ? <Instagram className="w-4 h-4" />
      : <Youtube className="w-4 h-4" />;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Viral Inspiration</h3>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Loading...
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Viral Inspiration</h3>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {reels.length} reels
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {reels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/50 transition-all overflow-hidden group"
                onClick={() => setSelectedReel(reel)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                      <Play className="w-8 h-8 text-white" fill="white" />
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <Badge className={cn(
                        "text-[10px] py-0",
                        reel.platform === 'instagram'
                          ? "bg-pink-500/80"
                          : "bg-red-500/80"
                      )}>
                        <PlatformIcon platform={reel.platform} />
                      </Badge>
                    </div>

                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant="secondary" className="text-[10px] py-0 bg-background/80">
                        {formatViews(reel.views)} views
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                      {reel.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {reel.creator_handle || reel.creator}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={fetchReels}
          variant="outline"
          className="w-full"
        >
          Load More Inspiration
        </Button>
      </div>

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

              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedReel.thumbnail_url}
                  alt={selectedReel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{selectedReel.creator}</p>
                  <p className="text-xs text-muted-foreground">{selectedReel.creator_handle}</p>
                </div>
                <Badge variant="secondary">{formatViews(selectedReel.views)} views</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{formatViews(selectedReel.likes)}</div>
                  <div className="text-muted-foreground">Likes</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{formatViews(selectedReel.shares)}</div>
                  <div className="text-muted-foreground">Shares</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{selectedReel.engagement_rate.toFixed(1)}%</div>
                  <div className="text-muted-foreground">Engagement</div>
                </div>
              </div>

              {selectedReel.metadata && (
                <div className="space-y-3">
                  {selectedReel.metadata.hook_analysis && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        Why This Works
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedReel.metadata.hook_analysis}
                      </p>
                    </div>
                  )}

                  {selectedReel.metadata.pacing_notes && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Pacing:</span>
                      <p className="text-sm">{selectedReel.metadata.pacing_notes}</p>
                    </div>
                  )}

                  {selectedReel.metadata.audio_tip && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Audio:</span>
                      <p className="text-sm">{selectedReel.metadata.audio_tip}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedReel.category && selectedReel.category.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedReel.category.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}

              {selectedReel.video_url && (
                <Button
                  onClick={() => window.open(selectedReel.video_url, '_blank')}
                  className="w-full gap-2 bg-gradient-hype"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch Full Video
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}