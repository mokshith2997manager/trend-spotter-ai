import { useNavigate } from 'react-router-dom';
import { Zap, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { XPBar } from './XPBar';

interface HeaderProps {
  xp?: number;
  showXP?: boolean;
}

export function Header({ xp = 0, showXP = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hype flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Hype<span className="text-primary">Lens</span>
          </span>
        </div>

        {showXP && (
          <div className="flex-1 max-w-32 mx-4">
            <XPBar xp={xp} showLevel={false} />
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </header>
  );
}