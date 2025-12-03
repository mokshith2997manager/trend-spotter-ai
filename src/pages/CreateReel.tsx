import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Play,
  Pause,
  Square,
  Loader,
  Upload,
  Video,
  Sparkles,
  Settings,
  Trash2,
  Check,
  X
} from 'lucide-react';

type EditorState = 'recording' | 'editing' | 'preview' | 'publishing';
type FilterType = 'normal' | 'vintage' | 'cool' | 'warm' | 'bw';

interface FilterOption {
  name: FilterType;
  label: string;
  filter: string;
}

const filters: FilterOption[] = [
  { name: 'normal', label: 'Normal', filter: 'brightness(1) contrast(1) saturate(1)' },
  { name: 'vintage', label: 'Vintage', filter: 'brightness(1.1) contrast(0.9) saturate(0.7) sepia(0.3)' },
  { name: 'cool', label: 'Cool', filter: 'brightness(0.95) contrast(1.1) saturate(1.2) hue-rotate(180deg)' },
  { name: 'warm', label: 'Warm', filter: 'brightness(1.1) contrast(0.95) saturate(1.3) hue-rotate(10deg)' },
  { name: 'bw', label: 'B&W', filter: 'grayscale(1) contrast(1.2)' }
];

export default function CreateReel() {
  const [state, setState] = useState<EditorState>('recording');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, [user, navigate]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera permissions to record reels',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setState('editing');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording failed',
        description: 'Could not start recording',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePublish = async () => {
    if (!recordedBlob || !title.trim() || !user) {
      toast({
        title: 'Missing information',
        description: 'Please add a title and record a video',
        variant: 'destructive'
      });
      return;
    }

    setIsPublishing(true);

    try {
      const fileName = `reel_${user.id}_${Date.now()}.webm`;

      const { data, error: uploadError } = await supabase.storage
        .from('user_reels')
        .upload(fileName, recordedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user_reels')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('user_reels')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          video_url: publicUrl,
          duration_seconds: 60,
          status: 'published',
          metadata: {
            filter: selectedFilter,
            recorded_at: new Date().toISOString()
          }
        });

      if (dbError) throw dbError;

      toast({
        title: 'Reel published!',
        description: 'Your reel is now live'
      });

      setShowPublishDialog(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error publishing reel:', error);
      toast({
        title: 'Publishing failed',
        description: 'Could not save your reel',
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = () => {
    setRecordedBlob(null);
    setTitle('');
    setDescription('');
    setSelectedFilter('normal');
    setState('recording');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header xp={profile?.xp || 0} showXP={!!profile} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {state === 'recording' && !recordedBlob && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative bg-background rounded-xl overflow-hidden aspect-video bg-muted flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-2 justify-center">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="gap-2 bg-red-500 hover:bg-red-600"
                    >
                      <Camera className="w-5 h-5" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="destructive"
                      className="gap-2"
                    >
                      <Square className="w-5 h-5" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Recording...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {state === 'editing' && recordedBlob && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Edit Your Reel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <video
                  src={URL.createObjectURL(recordedBlob)}
                  controls
                  className="w-full rounded-lg bg-muted"
                  style={{
                    filter: filters.find(f => f.name === selectedFilter)?.filter
                  }}
                />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Filters</div>
                  <div className="grid grid-cols-5 gap-2">
                    {filters.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFilter(f.name)}
                        className={`p-3 rounded-lg text-center text-xs font-medium transition-all ${
                          selectedFilter === f.name
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Give your reel a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {title.length}/100
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Add a description (optional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {description.length}/500
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDiscard}
                    variant="outline"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                  <Button
                    onClick={() => setShowPublishDialog(true)}
                    className="flex-1 bg-gradient-hype"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!recordedBlob && !isRecording && state === 'recording' && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Video className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold mb-1">Ready to Create?</h3>
                <p className="text-sm text-muted-foreground">
                  Record a short video and make it viral with our editing tools
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Your Reel?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Title</div>
              <div className="text-sm text-muted-foreground">{title}</div>
            </div>
            {description && (
              <div>
                <div className="text-sm font-medium mb-2">Description</div>
                <div className="text-sm text-muted-foreground line-clamp-3">{description}</div>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => setShowPublishDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="gap-2 bg-gradient-hype"
            >
              {isPublishing && <Loader className="w-4 h-4 animate-spin" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}