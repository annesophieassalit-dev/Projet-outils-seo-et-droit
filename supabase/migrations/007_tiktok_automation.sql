-- TikTok automation tables

CREATE TABLE IF NOT EXISTS tiktok_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tiktok_user_id)
);

CREATE TABLE IF NOT EXISTS tiktok_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES tiktok_accounts(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('carousel', 'video_long')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  pillar TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]',
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  tiktok_post_id TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  image_urls TEXT[] DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tiktok_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL,
  hook TEXT,
  content_type TEXT NOT NULL DEFAULT 'carousel' CHECK (content_type IN ('carousel', 'video_long')),
  used BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tiktok_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  auto_publish BOOLEAN DEFAULT FALSE,
  post_times TEXT[] DEFAULT ARRAY['09:00', '18:00'],
  timezone TEXT DEFAULT 'Europe/Paris',
  daily_carousel_count INTEGER DEFAULT 2,
  daily_video_count INTEGER DEFAULT 1,
  auto_generate BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE tiktok_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tiktok_accounts" ON tiktok_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tiktok_content" ON tiktok_content
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tiktok_topics" ON tiktok_topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own tiktok_settings" ON tiktok_settings
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tiktok_content_user_status ON tiktok_content(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tiktok_content_scheduled ON tiktok_content(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_tiktok_topics_user_unused ON tiktok_topics(user_id, used) WHERE used = FALSE;
