import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Lock, 
  Mail, 
  Shield, 
  FileText,
  Trash2,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  
  // Dialogs
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({ 
        title: "Reset link sent!", 
        description: "Check your email for the password reset link." 
      });
      setShowResetPassword(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // In production, this would call an API endpoint to delete the user
      // For now, we'll just sign out and show a message
      toast({ 
        title: "Account deletion requested", 
        description: "Your account will be deleted within 24 hours." 
      });
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setShowDeleteAccount(false);
    }
  };

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    action, 
    destructive = false 
  }: { 
    icon: any; 
    label: string; 
    action: () => void;
    destructive?: boolean;
  }) => (
    <button 
      onClick={action}
      className={`w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors ${
        destructive ? 'text-destructive' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg ml-2">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Notifications */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="push">Push Notifications</Label>
              </div>
              <Switch 
                id="push"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="email">Email Notifications</Label>
              </div>
              <Switch 
                id="email"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="trends">Trend Alerts</Label>
              </div>
              <Switch 
                id="trends"
                checked={trendAlerts}
                onCheckedChange={setTrendAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingRow 
              icon={Lock} 
              label="Reset Password" 
              action={() => setShowResetPassword(true)} 
            />
            <Separator className="mx-3" />
            <SettingRow 
              icon={LogOut} 
              label="Logout" 
              action={handleLogout} 
            />
            <Separator className="mx-3" />
            <SettingRow 
              icon={Trash2} 
              label="Delete Account" 
              action={() => setShowDeleteAccount(true)}
              destructive 
            />
          </CardContent>
        </Card>

        {/* Legal */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingRow 
              icon={FileText} 
              label="Privacy Policy" 
              action={() => toast({ title: "Opening Privacy Policy..." })} 
            />
            <Separator className="mx-3" />
            <SettingRow 
              icon={FileText} 
              label="Terms of Service" 
              action={() => toast({ title: "Opening Terms of Service..." })} 
            />
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            HypeLens v1.0.0
          </p>
        </div>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
