-- ============================================================
-- ConformiWeb — Migration 004
-- Ajout compteur posts générés (total depuis l'inscription)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS posts_generated_total INTEGER NOT NULL DEFAULT 0;
