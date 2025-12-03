import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, Copy, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Hashtag {
  tag: string;
  score: number;
  category: string;
}

interface HashtagDiscoveryProps {
  trendTitle?: string;
  suggestedTags?: string[];
}

export function HashtagDiscovery({ trendTitle, suggestedTags = [] }: HashtagDiscoveryProps) {
  const { toast } = useToast();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Convert suggested tags to hashtag format
  useEffect(() => {
    if (suggestedTags.length > 0 && !hasGenerated) {
      const initial = suggestedTags.map((tag, i) => ({
        tag: tag.startsWith('#') ? tag : `#${tag}`,
        score: 90 - i * 10,
        category: 'suggested'
      }));
      setHashtags(initial);
    }
  }, [suggestedTags]);

  const generateMoreHashtags = async () => {
    if (!trendTitle) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hashtags', {
        body: { trendTitle, existingTags: suggestedTags }
      });

      if (error) throw error;

      if (data?.hashtags) {
        const newHashtags = data.hashtags.map((h: any) => ({
          tag: h.tag.startsWith('#') ? h.tag : `#${h.tag}`,
          score: h.score || 80,
          category: h.category || 'ai-generated'
        }));
        
        // Combine with existing and remove duplicates
        const combined = [...hashtags, ...newHashtags];
        const unique = combined.filter((h, i, arr) => 
          arr.findIndex(x => x.tag.toLowerCase() === h.tag.toLowerCase()) === i
        );
        
        setHashtags(unique.sort((a, b) => b.score - a.score));
        setHasGenerated(true);
      }
    } catch (err) {
      console.error('Failed to generate hashtags:', err);
      toast({
        title: "Couldn't generate hashtags",
        description: "Using suggested tags instead",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast({ title: "Copied!", description: tag });
  };

  const copyAllHashtags = () => {
    const allTags = hashtags.map(h => h.tag).join(' ');
    navigator.clipboard.writeText(allTags);
    toast({ title: "All hashtags copied!" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-yellow-400';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Trending Hashtags
          </CardTitle>
          <div className="flex gap-2">
            {hashtags.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={copyAllHashtags}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Hashtag list */}
        <div className="flex flex-wrap gap-2">
          {hashtags.map((hashtag, index) => (
            <motion.div
              key={hashtag.tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Badge 
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5"
                onClick={() => copyHashtag(hashtag.tag)}
              >
                <span className="mr-2">{hashtag.tag}</span>
                <span className={`text-xs ${getScoreColor(hashtag.score)}`}>
                  {hashtag.score}%
                </span>
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Generate more button */}
        {trendTitle && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={generateMoreHashtags}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {hasGenerated ? 'Generate More' : 'AI Generate Hashtags'}
              </>
            )}
          </Button>
        )}

        {/* Tips */}
        <div className="bg-muted/30 rounded-lg p-3 mt-3">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <span>
              Higher scores indicate better viral potential. Mix high and medium score tags for best reach.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
