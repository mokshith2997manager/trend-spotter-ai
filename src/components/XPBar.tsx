import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface XPBarProps {
  xp: number;
  className?: string;
  showLevel?: boolean;
}

export function XPBar({ xp, className, showLevel = true }: XPBarProps) {
  // Calculate level (every 100 XP = 1 level)
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpToNextLevel = 100;
  const progress = (xpInCurrentLevel / xpToNextLevel) * 100;

  return (
    <div className={cn("space-y-1", className)}>
      {showLevel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-foreground">Level {level}</span>
          </div>
          <span className="text-muted-foreground">
            {xpInCurrentLevel} / {xpToNextLevel} XP
          </span>
        </div>
      )}
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-score transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}