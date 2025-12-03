export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  xp: number;
  interests: string[];
  badges: string[];
  avatar_url: string | null;
  created_at: string;
  last_active_at: string;
}

export interface Trend {
  id: string;
  title: string;
  score: number;
  confidence_level: 'low' | 'medium' | 'high';
  examples: string[];
  explain: string | null;
  suggested_tags: string[];
  sources: Record<string, unknown>;
  score_history: Array<{ ts: string; score: number }>;
  raw_ai: string | null;
  created_at: string;
  last_scored_at: string;
}

export interface Action {
  id: string;
  user_id: string;
  type: 'bet' | 'adWatched' | 'bookmark' | 'share';
  trend_id: string | null;
  delta_xp: number;
  ts: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  trend_id: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface ViralReel {
  id: string;
  platform: 'instagram' | 'youtube';
  platform_video_id: string;
  title: string;
  creator: string;
  creator_handle: string | null;
  thumbnail_url: string;
  video_url: string | null;
  views: number;
  likes: number;
  shares: number;
  comments_count: number;
  engagement_rate: number;
  duration_seconds: number | null;
  posted_at: string | null;
  fetched_at: string;
  metadata: Record<string, unknown>;
  category: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserReel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  trend_id: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  shares: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'trend_alert' | 'score_milestone' | 'new_content' | 'recommendation';
  title: string;
  description: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  trend_alerts_enabled: boolean;
  score_milestones_enabled: boolean;
  new_content_enabled: boolean;
  recommendations_enabled: boolean;
  trend_alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CarouselSlide {
  id: string;
  display_order: number;
  headline: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_action: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}