import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotificationPreferences } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Zap, Sparkles, TrendingUp } from 'lucide-react';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPreferences();
  }, [user, navigate]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else if (user) {
        const newPrefs: Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          trend_alerts_enabled: true,
          score_milestones_enabled: true,
          new_content_enabled: true,
          recommendations_enabled: true,
          trend_alert_threshold: 70
        };
        const { data: created, error: createError } = await supabase
          .from('notification_preferences')
          .insert([newPrefs])
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(created);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: 'Error',
        description: 'Could not load notification settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          trend_alerts_enabled: preferences.trend_alerts_enabled,
          score_milestones_enabled: preferences.score_milestones_enabled,
          new_content_enabled: preferences.new_content_enabled,
          recommendations_enabled: preferences.recommendations_enabled,
          trend_alert_threshold: preferences.trend_alert_threshold,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'Notification settings updated'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Could not save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header xp={profile?.xp || 0} showXP={!!profile} />
        <main className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Could not load settings</h3>
            <Button onClick={() => navigate('/settings')}>Back to Settings</Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header xp={profile?.xp || 0} showXP={!!profile} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Notification Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Trend Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                      Get notified when trends reach your score threshold
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.trend_alerts_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      trend_alerts_enabled: checked
                    })
                  }
                />
              </div>

              {preferences.trend_alerts_enabled && (
                <div className="ml-8 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Alert Threshold: {preferences.trend_alert_threshold}
                    </label>
                    <Slider
                      value={[preferences.trend_alert_threshold]}
                      onValueChange={(value) =>
                        setPreferences({
                          ...preferences,
                          trend_alert_threshold: value[0]
                        })
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Only alert for trends with score {preferences.trend_alert_threshold} or higher
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Score Milestones</h3>
                    <p className="text-xs text-muted-foreground">
                      Celebrate when you reach new XP milestones
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.score_milestones_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      score_milestones_enabled: checked
                    })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">New Content</h3>
                    <p className="text-xs text-muted-foreground">
                      Get notified about new trending topics
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.new_content_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      new_content_enabled: checked
                    })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Recommendations</h3>
                    <p className="text-xs text-muted-foreground">
                      Personalized recommendations based on your interests
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.recommendations_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({
                      ...preferences,
                      recommendations_enabled: checked
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-hype"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}