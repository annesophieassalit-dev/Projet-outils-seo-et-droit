-- ============================================================
-- LexZen — Migration 006
-- Table usage_events : historique de toutes les actions
-- Permet les stats sur n'importe quelle période
-- ============================================================

CREATE TABLE public.usage_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('diagnostic', 'scan', 'post')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_events_user    ON public.usage_events(user_id);
CREATE INDEX idx_usage_events_type    ON public.usage_events(type);
CREATE INDEX idx_usage_events_created ON public.usage_events(created_at DESC);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Service role uniquement (pas d'accès direct utilisateur)
CREATE POLICY "usage_events_service_only" ON public.usage_events
  FOR ALL USING (false);
