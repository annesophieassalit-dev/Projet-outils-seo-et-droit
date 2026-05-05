-- ============================================================
-- Visible & Conforme — Migration 008
-- Modèle essai gratuit 14 jours (sans CB)
-- Remplace le freemium permanent
-- ============================================================

-- Ajouter la colonne trial_ends_at
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Donner un essai de 14 jours aux utilisateurs existants sans abonnement payant
UPDATE public.profiles
SET trial_ends_at = NOW() + interval '14 days'
WHERE trial_ends_at IS NULL
  AND plan = 'gratuit'
  AND subscription_status IN ('inactive', NULL);

-- Mettre à jour handle_new_user pour initialiser le trial automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, profession, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'profession',
    NOW() + interval '14 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
