-- ============================================================
-- ConformiWeb — Migration 003
-- Ajout compteur scans mensuels + mise à jour limites
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS scans_used_this_month INTEGER NOT NULL DEFAULT 0;
