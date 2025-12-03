/*
  # Create Viral Reels Tables

  1. New Tables
    - `viral_reels` - Stores fetched reels from Instagram and YouTube APIs
      - `id` (uuid, primary key)
      - `platform` (text: 'instagram' | 'youtube')
      - `platform_video_id` (text, unique per platform)
      - `title` (text)
      - `creator` (text)
      - `creator_handle` (text)
      - `thumbnail_url` (text)
      - `video_url` (text, nullable)
      - `views` (integer)
      - `likes` (integer)
      - `shares` (integer)
      - `comments_count` (integer)
      - `engagement_rate` (decimal)
      - `duration_seconds` (integer, nullable)
      - `posted_at` (timestamp)
      - `fetched_at` (timestamp)
      - `metadata` (jsonb - hook analysis, pacing notes, etc.)
      - `category` (text array)
      - `is_approved` (boolean - for admin curation)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_reels` - Stores user-created reels
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text, nullable)
      - `video_url` (text)
      - `thumbnail_url` (text)
      - `duration_seconds` (integer)
      - `trend_id` (uuid, foreign key - nullable)
      - `status` (text: 'draft' | 'published' | 'archived')
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `shares` (integer, default 0)
      - `metadata` (jsonb - filters, effects, etc.)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Row Level Security
    - viral_reels: public read for approved reels, authenticated users can view all
    - user_reels: users can only read/update/delete their own reels

  3. Indexes
    - viral_reels: platform, platform_video_id, engagement_rate, is_approved
    - user_reels: user_id, status, created_at
*/

CREATE TABLE IF NOT EXISTS public.viral_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube')),
  platform_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  creator_handle TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  duration_seconds INTEGER,
  posted_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,
  category TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, platform_video_id)
);

CREATE TABLE IF NOT EXISTS public.user_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL,
  trend_id UUID REFERENCES public.trends(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trend_alert', 'score_milestone', 'new_content', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  trend_alerts_enabled BOOLEAN DEFAULT true,
  score_milestones_enabled BOOLEAN DEFAULT true,
  new_content_enabled BOOLEAN DEFAULT true,
  recommendations_enabled BOOLEAN DEFAULT true,
  trend_alert_threshold INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_order INTEGER NOT NULL,
  headline TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT,
  cta_action TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.viral_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for viral_reels: Public read for approved reels
CREATE POLICY "Anyone can view approved viral reels"
  ON public.viral_reels FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Authenticated users can view all viral reels"
  ON public.viral_reels FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_reels: Users can only access their own
CREATE POLICY "Users can view own reels"
  ON public.user_reels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reels"
  ON public.user_reels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reels"
  ON public.user_reels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reels"
  ON public.user_reels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications: Users can only view their own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_preferences: Users can only access their own
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for carousel_slides: Public read
CREATE POLICY "Anyone can view active carousel slides"
  ON public.carousel_slides FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_viral_reels_platform ON public.viral_reels(platform);
CREATE INDEX IF NOT EXISTS idx_viral_reels_platform_video_id ON public.viral_reels(platform, platform_video_id);
CREATE INDEX IF NOT EXISTS idx_viral_reels_engagement ON public.viral_reels(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_viral_reels_is_approved ON public.viral_reels(is_approved);
CREATE INDEX IF NOT EXISTS idx_user_reels_user_id ON public.user_reels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reels_status ON public.user_reels(status);
CREATE INDEX IF NOT EXISTS idx_user_reels_created_at ON public.user_reels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carousel_slides_order ON public.carousel_slides(display_order);