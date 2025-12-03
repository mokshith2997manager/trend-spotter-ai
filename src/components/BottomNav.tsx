import { NavLink } from '@/components/NavLink';
import { useNavigate } from 'react-router-dom';
import { Home, Trophy, User, Compass, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/discover', icon: Compass, label: 'Discover' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaders' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground flex-1"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => navigate('/create-reel')}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground flex-1"
        >
          <Video className="w-5 h-5" />
          <span className="text-xs font-medium">Create</span>
        </button>
      </div>
    </nav>
  );
}