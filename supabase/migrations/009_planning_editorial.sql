-- ============================================================
-- Visible & Conforme — Migration 009
-- Table planning_posts : planning éditorial réseaux sociaux
-- ============================================================

CREATE TABLE public.planning_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title        TEXT,                              -- titre/mémo interne
  content      TEXT NOT NULL,                     -- texte du post
  platform     TEXT NOT NULL DEFAULT 'instagram'
               CHECK (platform IN (
                 'instagram', 'linkedin', 'facebook',
                 'tiktok', 'threads', 'autre'
               )),
  content_type TEXT,                              -- type généré (bio_instagram, post_linkedin…)
  scheduled_at DATE,                              -- date de publication prévue
  status       TEXT NOT NULL DEFAULT 'brouillon'
               CHECK (status IN ('brouillon', 'programme', 'publie')),

  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_planning_user_id    ON public.planning_posts(user_id);
CREATE INDEX idx_planning_scheduled  ON public.planning_posts(user_id, scheduled_at);
CREATE INDEX idx_planning_status     ON public.planning_posts(user_id, status);

CREATE TRIGGER planning_posts_updated_at
  BEFORE UPDATE ON public.planning_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.planning_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planning_select_own" ON public.planning_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "planning_insert_own" ON public.planning_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "planning_update_own" ON public.planning_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "planning_delete_own" ON public.planning_posts
  FOR DELETE USING (auth.uid() = user_id);
