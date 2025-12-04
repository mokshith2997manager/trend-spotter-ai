import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Lightbulb,
  Loader2
} from 'lucide-react';

interface TrendAnalysis {
  topic: string;
  score: number;
  trend: 'rising' | 'stable' | 'declining';
  reasoning: string;
  suggestions: string[];
  hashtags: string[];
}

export function AITrendChecker() {
  const [topic, setTopic] = useState('');
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeTrend = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to analyze');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-trend', {
        body: { topic: topic.trim() }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err: unknown) {
      console.error('Trend analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('429')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else if (errorMessage.includes('402')) {
        toast.error('AI credits exhausted. Please add funds.');
      } else {
        toast.error('Failed to analyze trend');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gradient-card border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Trend Checker
          <Badge variant="outline" className="text-[10px] ml-auto">Real-time</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter a topic, hashtag, or content idea to analyze..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[60px] resize-none"
          />
        </div>
        
        <Button 
          onClick={analyzeTrend} 
          disabled={loading || !topic.trim()}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Trend
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Virality Score:</span>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <Badge className={`
                ${analysis.trend === 'rising' ? 'bg-green-500/20 text-green-400' :
                  analysis.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'}
              `}>
                {getTrendIcon(analysis.trend)}
                <span className="ml-1 capitalize">{analysis.trend}</span>
              </Badge>
            </div>

            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Analysis
              </h4>
              <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
            </div>

            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Content Ideas:</h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.hashtags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Suggested Hashtags:</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}