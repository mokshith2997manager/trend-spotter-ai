import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  TrendingUp, 
  Zap, 
  Star, 
  Check, 
  Trash2,
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'achievement' | 'trend' | 'score' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'Your reel crossed 1K views!',
    description: 'Your fitness reel is gaining traction. Keep the momentum going!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false
  },
  {
    id: '2',
    type: 'trend',
    title: 'New trend added: AI Art Challenge',
    description: 'A new viral trend has been detected. Check it out in Reels Inspiration.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false
  },
  {
    id: '3',
    type: 'score',
    title: 'HYPE Score increased!',
    description: 'Your HYPE score went up by 5 points. Current score: 82',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Badge Earned: Trend Spotter',
    description: 'You discovered 3 trends before they went viral!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  },
  {
    id: '5',
    type: 'milestone',
    title: 'Weekly streak maintained!',
    description: "You've been active for 7 days straight. +10 XP bonus!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true
  }
];

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'score':
        return <Zap className="w-5 h-5 text-primary" />;
      case 'milestone':
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Notifications</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary/20 text-primary">
              {unreadCount} unread
            </Badge>
          </div>
        )}

        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "bg-card border-border/50 cursor-pointer transition-all",
                      !notification.read && "border-l-4 border-l-primary bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              "font-semibold text-sm line-clamp-1",
                              !notification.read && "text-foreground",
                              notification.read && "text-muted-foreground"
                            )}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {notification.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
