-- Migration 010 : Préférences praticien sur le profil
-- Ces champs permettent de préremplir le générateur de contenus

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ville           TEXT,
  ADD COLUMN IF NOT EXISTS themes_recurrents TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ton_prefere     TEXT DEFAULT 'chaleureux'
    CHECK (ton_prefere IN ('chaleureux', 'professionnel', 'sobre')),
  ADD COLUMN IF NOT EXISTS specificites    TEXT;
