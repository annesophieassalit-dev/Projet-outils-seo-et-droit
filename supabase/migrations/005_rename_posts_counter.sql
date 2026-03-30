-- ============================================================
-- ConformiWeb — Migration 005
-- Renommage compteur posts : total → mensuel
-- ============================================================

ALTER TABLE public.profiles
  RENAME COLUMN posts_generated_total TO posts_generated_this_month;
