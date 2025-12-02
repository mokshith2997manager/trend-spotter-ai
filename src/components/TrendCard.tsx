import { Trend } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendCardProps {
  trend: Trend;
  onClick?: () => void;
}

export function TrendCard({ trend, onClick }: TrendCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Low</Badge>;
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Flame className="w-5 h-5 text-orange-500" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5 text-green-400" />;
    return <Sparkles className="w-5 h-5 text-primary" />;
  };

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "bg-gradient-card border-border/50 cursor-pointer transition-all duration-300",
        "hover:shadow-glow hover:border-primary/50 hover:scale-[1.02]",
        "active:scale-[0.98]"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">
              {trend.title}
            </h3>
            {getConfidenceBadge(trend.confidence_level)}
          </div>
          
          <div className="flex flex-col items-center ml-4">
            <div className={cn(
              "text-3xl font-black",
              getScoreColor(trend.score)
            )}>
              {trend.score}
            </div>
            <div className="text-xs text-muted-foreground">HYPE</div>
          </div>
        </div>

        {trend.explain && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {trend.explain}
          </p>
        )}

        {trend.suggested_tags && trend.suggested_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {trend.suggested_tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs bg-muted/50 border-border/50"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getScoreIcon(trend.score)}
            <span className="text-xs text-muted-foreground">
              {new Date(trend.last_scored_at).toLocaleDateString()}
            </span>
          </div>
          
          {trend.examples && trend.examples.length > 0 && (
            <span className="text-xs text-primary">
              {trend.examples.length} caption{trend.examples.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}