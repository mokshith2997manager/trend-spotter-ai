import { motion } from 'framer-motion';
import { Zap, Target, Flame, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HypeScoreCardProps {
  score: number;
  consistency?: number;
  engagement?: number;
  creativity?: number;
  compact?: boolean;
}

export function HypeScoreCard({ 
  score, 
  consistency = 75, 
  engagement = 82, 
  creativity = 68,
  compact = false 
}: HypeScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradient = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-400';
    if (value >= 60) return 'from-yellow-500 to-amber-400';
    if (value >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };

  const metrics = [
    { label: 'Consistency', value: consistency, icon: Target },
    { label: 'Engagement', value: engagement, icon: Flame },
    { label: 'Creativity', value: creativity, icon: Sparkles },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-hype flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className={cn("text-2xl font-black", getScoreColor(score))}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground ml-1">HYPE</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 overflow-hidden">
      <CardContent className="p-4">
        {/* Main Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-14 h-14 rounded-full bg-gradient-hype flex items-center justify-center shadow-glow"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your HYPE</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-baseline"
              >
                <span className={cn("text-4xl font-black", getScoreColor(score))}>
                  {score}
                </span>
                <span className="text-muted-foreground text-sm ml-1">/100</span>
              </motion.div>
            </div>
          </div>
          
          {/* Ring visualization */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/30"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="url(#hypeGradient)"
                strokeWidth="3"
                strokeDasharray={`${score} ${100 - score}`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${score} ${100 - score}` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="hypeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(270, 80%, 60%)" />
                  <stop offset="100%" stopColor="hsl(320, 85%, 65%)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Breakdown Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="bg-muted/30 rounded-lg p-2 text-center"
            >
              <metric.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className={cn("text-lg font-bold", getScoreColor(metric.value))}>
                {metric.value}
              </p>
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
