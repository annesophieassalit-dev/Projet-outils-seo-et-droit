-- ============================================================
-- LexZen — Schéma initial
-- Migration 001 : Tables principales
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (données publiques liées à auth.users) ─────────────────────────

CREATE TABLE public.profiles (
  id                              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                           TEXT NOT NULL,
  full_name                       TEXT,
  profession                      TEXT,
  website_url                     TEXT,

  -- Abonnement
  plan                            TEXT NOT NULL DEFAULT 'gratuit'
                                  CHECK (plan IN ('gratuit', 'essentiel', 'pro')),
  subscription_status             TEXT DEFAULT 'inactive'
                                  CHECK (subscription_status IN (
                                    'active', 'trialing', 'canceled', 'past_due', 'inactive'
                                  )),
  stripe_customer_id              TEXT UNIQUE,
  stripe_subscription_id          TEXT UNIQUE,
  subscription_current_period_end TIMESTAMPTZ,

  -- Compteur audits mensuel
  audits_used_this_month          INTEGER NOT NULL DEFAULT 0,
  audits_reset_date               TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + interval '1 month'),

  created_at                      TIMESTAMPTZ DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── AUDITS ──────────────────────────────────────────────────────────────────

CREATE TABLE public.audits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url               TEXT NOT NULL,
  profession        TEXT,                         -- profession au moment de l'audit

  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message     TEXT,

  -- Scores synthétiques (pour les listes et statistiques)
  seo_score         SMALLINT CHECK (seo_score BETWEEN 0 AND 100),
  seo_grade         CHAR(1),
  legal_score       SMALLINT CHECK (legal_score BETWEEN 0 AND 100),
  legal_grade       CHAR(1),
  legal_risk_level  TEXT CHECK (legal_risk_level IN ('faible', 'modere', 'eleve', 'critique')),
  global_score      SMALLINT CHECK (global_score BETWEEN 0 AND 100),
  pages_analyzed    INTEGER DEFAULT 1,

  -- Résultats complets (JSONB pour flexibilité)
  seo_data          JSONB,  -- SeoScore complet
  legal_data        JSONB,  -- LegalScore complet

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,

  -- Index de recherche
  CONSTRAINT audits_url_length CHECK (char_length(url) <= 2048)
);

CREATE INDEX idx_audits_user_id       ON public.audits(user_id);
CREATE INDEX idx_audits_created_at    ON public.audits(created_at DESC);
CREATE INDEX idx_audits_status        ON public.audits(status) WHERE status != 'completed';
CREATE INDEX idx_audits_user_created  ON public.audits(user_id, created_at DESC);

-- ─── STRIPE EVENTS (idempotence) ─────────────────────────────────────────────

CREATE TABLE public.stripe_events (
  id           TEXT PRIMARY KEY,   -- Stripe event ID (evt_xxx)
  type         TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS (Row Level Security) ─────────────────────────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Audits
CREATE POLICY "audits_select_own" ON public.audits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audits_insert_own" ON public.audits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "audits_update_own" ON public.audits
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role peut tout faire (webhooks Stripe, etc.)
-- (Le service role bypasse RLS par défaut dans Supabase)

-- ─── TRIGGER : création profil automatique à l'inscription ───────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, profession)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'profession'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
