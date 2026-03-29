-- ============================================================
-- ConformiWeb — Règles juridiques en base de données
-- Migration 002 : Table legal_rules (modifiable sans redéploiement)
-- Permet à la juriste de mettre à jour les règles via une interface admin
-- ============================================================

CREATE TABLE public.legal_rules (
  id               TEXT PRIMARY KEY,   -- ex: 'EI-001', 'CP-003'
  category         TEXT NOT NULL CHECK (category IN (
                     'exercice_illegal',
                     'confusion_professionnelle',
                     'mentions_obligatoires',
                     'publicite_mensongere',
                     'protection_consommateur'
                   )),
  severity         TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
  term             TEXT NOT NULL,           -- version lisible
  pattern          TEXT,                    -- regex JS (string)
  recommendation   TEXT NOT NULL,
  legal_reference  TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  notes            TEXT,                    -- notes internes de la juriste
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.legal_rules ENABLE ROW LEVEL SECURITY;

-- Lecture par tous les utilisateurs authentifiés
CREATE POLICY "legal_rules_read" ON public.legal_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Écriture réservée au service role (admin)
-- Les updates se font via le dashboard Supabase ou une interface admin dédiée

CREATE TRIGGER legal_rules_updated_at
  BEFORE UPDATE ON public.legal_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Données initiales ────────────────────────────────────────────────────────

INSERT INTO public.legal_rules
  (id, category, severity, term, pattern, recommendation, legal_reference)
VALUES

-- Exercice illégal
('EI-001', 'exercice_illegal', 'error',
 'soigner / je soigne',
 '\b(je\s+)?soigne(rai[st]?|z)?\b',
 'Remplacez par "accompagner", "soutenir", "prendre soin de". L''acte de soigner est réservé aux professionnels de santé réglementés.',
 'Art. L4161-1 Code de la santé publique'),

('EI-002', 'exercice_illegal', 'error',
 'traiter / traitement de',
 '\b(je\s+)?(traite[sz]?|traitement\s+de\b)',
 'Utilisez "accompagnement de", "soutien naturel pour", "approche holistique de".',
 'Art. L4161-1 CSP'),

('EI-003', 'exercice_illegal', 'error',
 'guérir / guérison de',
 '\b(guéri[rt]?|guérison\s+de\b)',
 'Remplacez par "amélioration du bien-être", "soutien de l''équilibre naturel".',
 'Art. L4161-1 CSP + Art. L121-1 Code de la consommation'),

('EI-004', 'exercice_illegal', 'error',
 'diagnostiquer / poser un diagnostic',
 '\b(diagnostiqu[a-z]+|pose\s+un\s+diagnostic)\b',
 'Le diagnostic médical est réservé aux médecins. Utilisez "évaluer votre vitalité" ou supprimez.',
 'Art. L4161-1 CSP'),

('EI-005', 'exercice_illegal', 'error',
 'prescrire / ordonnance',
 '\b(prescri[a-z]+|ordonnance)\b',
 'La prescription médicamenteuse est réservée aux médecins. Utilisez "je recommande", "je conseille".',
 'Art. L4211-1 CSP'),

('EI-006', 'exercice_illegal', 'warning',
 'thérapie / thérapeutique',
 '\b(thérapie|thérapeutique|protocole\s+de\s+soin)\b',
 'Ces termes ont une connotation médicale. Préférez "séance", "accompagnement", "approche".',
 'Recommandation DGCCRF 2021'),

-- Confusion professionnelle
('CP-001', 'confusion_professionnelle', 'error',
 'Dr. [Nom]',
 '\bdr\.?\s+[A-Z]',
 'L''usage du titre "Dr." est réservé aux docteurs en médecine, pharmacie, chirurgie dentaire.',
 'Art. 433-17 Code pénal — usurpation de titre'),

('CP-002', 'confusion_professionnelle', 'error',
 'docteur / médecin naturel',
 '\b(docteur|médecin\s+naturel|médecin\s+holistique)\b',
 'Ces titres sont protégés. Si vous n''êtes pas médecin, vous ne pouvez pas utiliser ces termes.',
 'Art. L4131-1 CSP + Art. 433-17 Code pénal'),

('CP-003', 'confusion_professionnelle', 'warning',
 'clinique / cabinet médical',
 '\b(clinique|cabinet\s+médical|centre\s+médical|hôpital)\b',
 'Ces termes évoquent une structure médicale réglementée. Utilisez "cabinet de bien-être", "espace holistique".',
 'Art. L6122-1 CSP'),

('CP-004', 'confusion_professionnelle', 'warning',
 'patient(s)',
 '\b(patient[s]?)\b',
 'Le terme "patient" appartient au vocabulaire médical. Utilisez "client", "personne accompagnée".',
 'Recommandation DGCCRF'),

-- Publicité mensongère
('PM-001', 'publicite_mensongere', 'error',
 'résultats garantis / 100% efficace',
 '\b(résultat[s]?\s+garanti[s]?|garantie\s+de\s+résultat|100\s*%\s+efficace|efficacité\s+prouvée\s+scientifiquement)\b',
 'Allégations de résultats garantis illicites en l''absence de preuves scientifiques reconnues.',
 'Art. L121-1 et L121-2 Code de la consommation'),

('PM-002', 'publicite_mensongere', 'warning',
 'méthode révolutionnaire / secret ancestral',
 '\b(méthode\s+révolutionnaire|technologie\s+exclusive|secret\s+(ancestral|millénaire))\b',
 'Ces affirmations invérifiables peuvent être qualifiées de pratiques commerciales trompeuses.',
 'Art. L121-2 Code de la consommation'),

-- Protection consommateur
('PC-001', 'protection_consommateur', 'error',
 'vente en ligne détectée',
 '\b(réservation|achat|commande|abonnement)\s+(en\s+ligne|sur\s+ce\s+site)\b',
 'La vente de services en ligne impose le droit de rétractation de 14 jours dans vos CGV.',
 'Art. L221-18 Code de la consommation');
