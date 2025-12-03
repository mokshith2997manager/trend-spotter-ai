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