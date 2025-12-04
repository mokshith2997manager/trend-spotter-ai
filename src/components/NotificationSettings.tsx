import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, Gift, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    preferences,
    requestPermission,
    updatePreferences
  } = useNotifications();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notifications enabled!', {
        description: "You'll receive alerts for daily rewards and trending topics."
      });
    } else {
      toast.error('Notifications blocked', {
        description: 'Please enable notifications in your browser settings.'
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Notifications are not supported in your browser.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
          {permission === 'granted' ? (
            <Badge className="ml-auto bg-green-500/20 text-green-400">Enabled</Badge>
          ) : permission === 'denied' ? (
            <Badge className="ml-auto bg-red-500/20 text-red-400">Blocked</Badge>
          ) : (
            <Badge className="ml-auto bg-yellow-500/20 text-yellow-400">Not Set</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission !== 'granted' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to get reminders about daily rewards and trending topics.
            </p>
            <Button 
              onClick={handleEnableNotifications}
              className="w-full"
              disabled={permission === 'denied'}
            >
              <Bell className="w-4 h-4 mr-2" />
              {permission === 'denied' ? 'Blocked in Browser' : 'Enable Notifications'}
            </Button>
            {permission === 'denied' && (
              <p className="text-xs text-muted-foreground text-center">
                To enable, go to your browser settings and allow notifications for this site.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {preferences.notifications_enabled ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="notifications-enabled" className="font-medium">
                    All Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Master toggle for all notifications
                  </p>
                </div>
              </div>
              <Switch
                id="notifications-enabled"
                checked={preferences.notifications_enabled}
                onCheckedChange={(checked) => 
                  updatePreferences({ notifications_enabled: checked })
                }
              />
            </div>

            {preferences.notifications_enabled && (
              <>
                <div className="border-t border-border/50 pt-4 space-y-4">
                  {/* Daily Rewards */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-yellow-400" />
                      <div>
                        <Label htmlFor="notify-daily" className="font-medium">
                          Daily Rewards
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Remind when rewards are available
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="notify-daily"
                      checked={preferences.notify_daily_rewards}
                      onCheckedChange={(checked) => 
                        updatePreferences({ notify_daily_rewards: checked })
                      }
                    />
                  </div>

                  {/* Trending Topics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div>
                        <Label htmlFor="notify-trending" className="font-medium">
                          Trending Topics
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Alert for hot new trends
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="notify-trending"
                      checked={preferences.notify_trending}
                      onCheckedChange={(checked) => 
                        updatePreferences({ notify_trending: checked })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}