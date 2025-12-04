-- Add column to track last daily reward claim
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_reward_at timestamp with time zone DEFAULT NULL;

-- Add column to track streak
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;