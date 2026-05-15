export type Severity = "error" | "warning" | "info" | "success";

export interface AuditIssue {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  excerpt?: string; // texte extrait de la page concernée
  url?: string;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export interface SeoMetaResult {
  titleTag: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  schemaMarkup: string[];
}

export interface SeoContentResult {
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h3Count: number;
  wordCount: number;
  imagesWithoutAlt: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;
  hasHttps: boolean;
  hasMobileViewport: boolean;
}

export interface SeoScore {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  issues: AuditIssue[];
  meta: SeoMetaResult;
  content: SeoContentResult;
  seoAiAnalysis?: string;
}

// ─── LEGAL ────────────────────────────────────────────────────────────────────

export type LegalRuleCategory =
  | "exercice_illegal" // risque exercice illégal de la médecine
  | "mentions_obligatoires" // mentions légales, CGV, RGPD
  | "confusion_professionnelle" // termes créant confusion avec professionnel de santé
  | "publicite_mensongere" // allégations sans preuve, promesses excessives
  | "protection_consommateur"; // droit de rétractation, prix TTC, etc.

export interface LegalRuleMatch {
  ruleId: string;
  category: LegalRuleCategory;
  severity: Severity;
  term: string;
  context: string; // phrase complète autour du terme
  url: string;
  recommendation: string;
  legalReference?: string; // ex: "Art. L4161-1 Code de la santé publique"
}

export interface LegalMentionsCheck {
  hasMentionsLegales: boolean;
  hasPolitiqueConfidentialite: boolean;
  hasCGV: boolean;
  hasDroitRetractation: boolean;
  hasCookiePolicy: boolean;
  hasSiret: boolean;
  hasProfessionalAddress: boolean;
}

export interface LegalScore {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  riskLevel: "faible" | "modere" | "eleve" | "critique";
  issues: AuditIssue[];
  matches: LegalRuleMatch[];
  mentionsCheck: LegalMentionsCheck;
  aiAnalysis?: string; // analyse nuancée par Claude AI
}

// ─── AUDIT GLOBAL ─────────────────────────────────────────────────────────────

export type AuditStatus = "pending" | "running" | "completed" | "failed";

export interface AuditResult {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  status: AuditStatus;
  seo: SeoScore | null;
  legal: LegalScore | null;
  globalScore: number | null;
  pagesAnalyzed: number;
  errorMessage?: string;
}

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────────

export type SubscriptionPlan = "gratuit" | "essentiel" | "pro"; // "essentiel" gardé pour compatibilité BDD
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  auditsUsedThisMonth: number;
  auditsLimit: number; // -1 = illimité
}

export const PLAN_LIMITS: Record<
  SubscriptionPlan,
  { auditsPerMonth: number; scansPerMonth: number; seoAudit: boolean; legalAudit: boolean; aiAnalysis: boolean; pdfExport: boolean; contentGenerator: boolean; history: number }
> = {
  gratuit: {
    auditsPerMonth: 1,
    scansPerMonth: 5,
    seoAudit: true,
    legalAudit: true,
    aiAnalysis: false,
    pdfExport: false,
    contentGenerator: false,
    history: 1,
  },
  essentiel: { // ancien plan, conservé pour compatibilité BDD
    auditsPerMonth: 3,
    scansPerMonth: 20,
    seoAudit: true,
    legalAudit: true,
    aiAnalysis: false,
    pdfExport: false,
    contentGenerator: false,
    history: 30,
  },
  pro: {
    auditsPerMonth: 3,
    scansPerMonth: -1, // illimité
    seoAudit: true,
    legalAudit: true,
    aiAnalysis: true,
    pdfExport: true,
    contentGenerator: true,
    history: -1,
  },
};
