CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'moderator', 'user')) NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100) NOT NULL,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  examples TEXT[] DEFAULT ARRAY[]::TEXT[],
  explain TEXT,
  suggested_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sources JSONB DEFAULT '{}'::JSONB,
  score_history JSONB DEFAULT '[]'::JSONB,
  raw_ai TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bet', 'adWatched', 'bookmark', 'share')),
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE,
  delta_xp INTEGER DEFAULT 0,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trend_id UUID REFERENCES public.trends(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, trend_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;