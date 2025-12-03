import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const INTEREST_OPTIONS = [
  { id: 'fashion', label: '👗 Fashion', emoji: '👗' },
  { id: 'tech', label: '💻 Tech', emoji: '💻' },
  { id: 'gaming', label: '🎮 Gaming', emoji: '🎮' },
  { id: 'music', label: '🎵 Music', emoji: '🎵' },
  { id: 'food', label: '🍔 Food', emoji: '🍔' },
  { id: 'fitness', label: '💪 Fitness', emoji: '💪' },
  { id: 'beauty', label: '💄 Beauty', emoji: '💄' },
  { id: 'travel', label: '✈️ Travel', emoji: '✈️' },
  { id: 'art', label: '🎨 Art', emoji: '🎨' },
  { id: 'crypto', label: '₿ Crypto', emoji: '₿' },
  { id: 'sports', label: '⚽ Sports', emoji: '⚽' },
  { id: 'movies', label: '🎬 Movies', emoji: '🎬' },
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleInterest = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      toast({ 
        title: "Select at least one interest",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const { error } = await updateProfile({ 
      interests: selected,
      badges: [...(profile?.badges || []), 'early-adopter']
    });

    if (error) {
      toast({ 
        title: "Failed to save interests",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ 
        title: "Interests saved!",
        description: "Your feed is now personalized"
      });
      navigate('/home');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-8 pt-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-hype flex items-center justify-center mx-auto shadow-glow">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">What interests you?</h1>
        <p className="text-muted-foreground">
          Select topics to personalize your trend feed
        </p>
      </div>

      {/* Interest Grid */}
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          {INTEREST_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.id);
            
            return (
              <Card
                key={option.id}
                onClick={() => toggleInterest(option.id)}
                className={cn(
                  "cursor-pointer transition-all duration-200 border-2",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-glow" 
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <CardContent className="p-3 text-center relative">
                  {isSelected && (
                    <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-primary" />
                  )}
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <p className="text-xs font-medium truncate">
                    {option.label.split(' ')[1]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {selected.length} selected
        </p>
      </div>

      {/* Continue Button */}
      <div className="max-w-md mx-auto w-full pt-4 pb-8">
        <Button
          onClick={handleContinue}
          disabled={loading || selected.length === 0}
          className="w-full bg-gradient-hype hover:opacity-90 h-12 text-lg"
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full mt-2"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}