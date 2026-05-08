// ─── Scanner de texte ─────────────────────────────────────────────────────────

export type RiskLevel = "critique" | "vigilance" | "neutre" | "conforme";

export interface ScannerAlert {
  term: string;           // le terme détecté tel quel dans le texte
  riskLevel: RiskLevel;
  category: string;       // "Exercice illégal" | "Confusion prof." | etc.
  context: string;        // phrase complète autour du terme
  reformulation?: string; // suggestion de remplacement
  legalReference?: string;
}

export interface ReformulationSuggestion {
  original: string;
  safe: string;
  explanation: string;
}

export interface ScannerResult {
  inputText: string;
  globalRisk: RiskLevel;
  globalRiskScore: number; // 0 (critique) à 100 (conforme)
  alerts: ScannerAlert[];
  reformulations: ReformulationSuggestion[];
  cleanedText?: string;   // version du texte avec toutes les corrections appliquées
  summary: string;        // résumé en 1-2 phrases
}

// ─── Générateur de contenus ───────────────────────────────────────────────────

export type ContentType =
  | "bio_instagram"
  | "presentation_activite"
  | "article_blog"
  | "post_linkedin"
  | "post_instagram"
  | "post_facebook"
  | "post_tiktok"
  | "post_threads"
  | "script_youtube"
  | "fiche_google"
  | "accroche_site"
  | "hook_reseaux";

export interface GeneratorInput {
  contentType: ContentType;
  profession: string;
  themes: string[];       // ex: ["stress", "sommeil", "émotions"]
  specificites?: string;  // infos supplémentaires libres
  tone?: "professionnel" | "chaleureux" | "sobre";
  intention?: "faire_connaitre" | "inviter_contact" | "expliquer";
}

export interface GeneratedContent {
  contentType: ContentType;
  content: string;
  complianceNote: string; // pourquoi ce contenu est conforme
  alternativeVersion?: string; // variante proposée
}

// ─── Bibliothèque de formulations ─────────────────────────────────────────────

export type FormulationTheme =
  | "stress"
  | "emotions"
  | "fatigue"
  | "douleurs"
  | "confiance"
  | "sommeil"
  | "alimentation"
  | "presentation_generale";

export interface FormulationEntry {
  id: string;
  theme: FormulationTheme;
  toAvoid: string;        // formulation risquée
  safe: string;           // formulation validée
  whyRisky: string;
  legalReference?: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  bio_instagram: "Bio Instagram",
  presentation_activite: "Présentation activité",
  article_blog: "Article de blog",
  post_linkedin: "Post LinkedIn",
  post_instagram: "Post Instagram",
  post_facebook: "Post Facebook",
  post_tiktok: "Script TikTok",
  post_threads: "Post Threads",
  script_youtube: "Script YouTube",
  fiche_google: "Fiche Google My Business",
  accroche_site: "Accroche site web",
  hook_reseaux: "Hooks / Accroches réseaux",
};

export const THEME_LABELS: Record<FormulationTheme, string> = {
  stress: "Stress & anxiété",
  emotions: "Émotions",
  fatigue: "Fatigue & énergie",
  douleurs: "Douleurs & tensions",
  confiance: "Confiance en soi",
  sommeil: "Sommeil",
  alimentation: "Alimentation",
  presentation_generale: "Présentation générale",
};
