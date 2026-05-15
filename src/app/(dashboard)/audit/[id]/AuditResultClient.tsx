"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { riskLevelColor, riskLevelLabel } from "@/lib/utils";
import type {
  AuditIssue,
  LegalRuleMatch,
  SeoScore,
  LegalScore,
  LexicalField,
} from "@/types/audit";

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
  );
}

function scoreColor(s: number) {
  if (s >= 80) return "#16a34a";
  if (s >= 60) return "#d97706";
  return "#dc2626";
}

function scoreBadgeClass(s: number) {
  if (s >= 80) return "bg-green-100 text-green-700";
  if (s >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "error":   return <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    case "success": return <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0 mt-0.5" />;
    default:        return <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    error:   "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-zen-100 text-zen-700",
    info:    "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = {
    error: "Critique", warning: "Avertissement", success: "Bon point", info: "Info",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[severity] ?? "bg-gray-100 text-gray-600"}`}>
      {labels[severity] ?? severity}
    </span>
  );
}

// ─── Issue Card ───────────────────────────────────────────────────────────────

function IssueCard({ issue }: { issue: AuditIssue }) {
  if (issue.severity === "success") {
    return (
      <div className="flex items-start gap-3 py-3 px-4 bg-zen-50/50 rounded-lg border border-zen-100">
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{issue.title}</p>
          {issue.excerpt && (
            <p className="text-xs text-gray-400 mt-0.5 italic truncate">{issue.excerpt}</p>
          )}
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>
    );
  }
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-start gap-3">
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
            <SeverityBadge severity={issue.severity} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{issue.category}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
      {issue.excerpt && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 font-mono border border-gray-100">
          {issue.excerpt}
        </div>
      )}
      {issue.recommendation && (
        <div className="bg-zen-50 rounded-lg px-3 py-2 text-xs text-zen-800 border border-zen-100">
          <strong>Comment corriger :</strong> {issue.recommendation}
        </div>
      )}
    </div>
  );
}

// ─── Legal Match Card ─────────────────────────────────────────────────────────

function LegalMatchCard({ match }: { match: LegalRuleMatch }) {
  const categoryLabels: Record<string, string> = {
    exercice_illegal:       "Risque d'assimilation à un acte médical réglementé",
    confusion_professionnelle: "Risque de confusion avec un titre protégé",
    mentions_obligatoires:  "Mention obligatoire",
    publicite_mensongere:   "Formulation pouvant être perçue comme trompeuse",
    protection_consommateur:"Vigilance protection du consommateur",
  };
  const termLabel: Record<string, string> = {
    exercice_illegal:       "Formulation susceptible d'être assimilée à un acte médical",
    confusion_professionnelle: "Terme pouvant créer une confusion avec un titre réglementé",
    publicite_mensongere:   "Formulation pouvant être interprétée comme une promesse de résultat",
    protection_consommateur:"Formulation pouvant être considérée comme une pression commerciale",
    mentions_obligatoires:  "Élément réglementaire à vérifier",
  };
  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-start gap-3">
        <SeverityIcon severity={match.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">«&nbsp;{match.term}&nbsp;»</p>
            <SeverityBadge severity={match.severity} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {termLabel[match.category] ?? categoryLabels[match.category] ?? match.category}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 border border-gray-100 italic">
        {match.context}
      </div>
      <div className="bg-zen-50 rounded-lg px-3 py-2 text-xs text-zen-800 border border-zen-100">
        <strong>Recommandation :</strong> {match.recommendation}
      </div>
      {match.legalReference && (
        <p className="text-xs text-gray-400">Référence : {match.legalReference}</p>
      )}
    </div>
  );
}

// ─── Lexical Field Panel ──────────────────────────────────────────────────────

function LexicalFieldPanel({ lexicalField }: { lexicalField: LexicalField }) {
  const maxCount = Math.max(...lexicalField.present.map((t) => t.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <BookOpen className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Champ lexical de votre activité</h3>
      </div>

      {lexicalField.present.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Termes présents — {lexicalField.present.length}
          </p>
          <div className="space-y-2.5">
            {lexicalField.present.slice(0, 9).map((term) => (
              <div key={term.term} className="flex items-center gap-3">
                <span className="text-xs text-gray-800 w-32 truncate font-medium shrink-0">
                  {term.term}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all"
                    style={{ width: `${Math.max(6, (term.count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-7 text-right font-mono shrink-0">
                  {term.count}×
                </span>
                <div className="flex gap-1 w-28 justify-end shrink-0">
                  {term.inTitle && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded font-medium">
                      Titre
                    </span>
                  )}
                  {term.inH1 && (
                    <span className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded font-medium">
                      H1
                    </span>
                  )}
                  {term.inH2 && (
                    <span className="text-[10px] bg-zen-50 text-zen-700 border border-zen-100 px-1.5 py-0.5 rounded font-medium">
                      H2
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          Aucun terme d&apos;activité bien-être détecté sur cette page.
        </p>
      )}

      {lexicalField.absent.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Termes absents — à intégrer si pertinent
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lexicalField.absent.map((term) => (
              <span
                key={term}
                className="text-xs px-2.5 py-1 bg-gray-50 border border-dashed border-gray-200 text-gray-400 rounded-full"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 pt-2 border-t border-gray-100 ${
        lexicalField.hasLocalSignal ? "text-zen-700" : "text-amber-600"
      }`}>
        {lexicalField.hasLocalSignal ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        <span className="text-xs font-medium">
          {lexicalField.hasLocalSignal
            ? "Localisation détectée (ville ou code postal présent)"
            : "Aucune localisation — ajoutez votre ville pour le SEO local"}
        </span>
      </div>
    </div>
  );
}

// ─── Accordion Section ────────────────────────────────────────────────────────

interface AccordionProps {
  id?: string;
  title: string;
  icon: React.ReactNode;
  accentBg: string;
  score: number | null;
  errorCount: number;
  warningCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  subtitle?: string;
}

function AccordionSection({
  id, title, icon, accentBg, score, errorCount, warningCount,
  isOpen, onToggle, children, subtitle,
}: AccordionProps) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors text-left"
      >
        <div className={`p-2.5 rounded-xl ${accentBg} shrink-0`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-bold text-gray-900 text-base">{title}</h2>
            {score !== null && (
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${scoreBadgeClass(score)}`}>
                {score}/100
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {errorCount > 0 && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {errorCount} critique{errorCount > 1 ? "s" : ""}
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} avertissement{warningCount > 1 ? "s" : ""}
              </span>
            )}
            {errorCount === 0 && warningCount === 0 && score !== null && (
              <span className="text-xs text-zen-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Aucun point critique
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-400">{subtitle}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Grid trick for smooth height animation */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-6 space-y-4 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  seo: SeoScore | null;
  legal: LegalScore | null;
  globalScore: number | null;
  auditId: string;
  isPro: boolean;
}

export default function AuditResultClient({ seo, legal, globalScore, auditId, isPro }: Props) {
  const [seoOpen, setSeoOpen] = useState(true);
  const [legalOpen, setLegalOpen] = useState(true);

  const seoErrors   = seo?.issues.filter((i) => i.severity === "error")   || [];
  const seoWarnings = seo?.issues.filter((i) => i.severity === "warning") || [];
  const seoInfos    = seo?.issues.filter((i) => i.severity === "info" || i.severity === "success") || [];

  const legalErrors   = legal?.issues.filter((i) => i.severity === "error")   || [];
  const legalWarnings = legal?.issues.filter((i) => i.severity === "warning") || [];

  const uniqueMatches = legal?.matches
    ? Array.from(new Map(legal.matches.map((m) => [m.ruleId, m])).values())
    : [];

  const LEGAL_FREE_LIMIT = 3;
  const legalAllItems    = [...uniqueMatches, ...legalErrors, ...legalWarnings];
  const legalVisibleItems = isPro ? legalAllItems : legalAllItems.slice(0, LEGAL_FREE_LIMIT);
  const legalHiddenCount  = isPro ? 0 : Math.max(0, legalAllItems.length - LEGAL_FREE_LIMIT);

  const visibleMatchIds = new Set(
    legalVisibleItems
      .filter((i): i is (typeof uniqueMatches)[number] => "ruleId" in i)
      .map((i) => i.ruleId),
  );
  const visibleIssueIds = new Set(
    legalVisibleItems
      .filter((i): i is (typeof legalErrors)[number] => "id" in i)
      .map((i) => i.id),
  );

  const lexicalField = (seo as SeoScore & { lexicalField?: LexicalField })?.lexicalField;

  function scrollTo(id: string, open: () => void) {
    open();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="xl:grid xl:grid-cols-[120px_1fr] xl:gap-5 xl:items-start">

      {/* ── Nav sticky latérale (xl+) ───────────────────────────────────────── */}
      <nav className="hidden xl:flex flex-col gap-2 sticky top-4">
        {seo && (
          <button
            onClick={() => scrollTo("seo-section", () => setSeoOpen(true))}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              seoOpen
                ? "bg-blue-50 border-blue-200 shadow-sm"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">Visibilité</span>
            </div>
            <span className={`text-xl font-bold block ${
              seo.score >= 80 ? "text-green-600" : seo.score >= 60 ? "text-amber-500" : "text-red-500"
            }`}>
              {seo.score}
            </span>
            <span className="text-[10px] text-gray-400">/100</span>
            {seoErrors.length > 0 && (
              <div className="mt-1.5 text-[10px] text-red-500 font-medium">
                {seoErrors.length} critique{seoErrors.length > 1 ? "s" : ""}
              </div>
            )}
          </button>
        )}

        <button
          onClick={() => scrollTo("legal-section", () => setLegalOpen(true))}
          className={`w-full text-left p-3 rounded-xl border transition-all ${
            legalOpen
              ? "bg-zen-50 border-zen-200 shadow-sm"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-zen-700 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700 leading-tight">Conformité</span>
          </div>
          {legal ? (
            <>
              <span className={`text-xl font-bold block ${
                legal.score >= 80 ? "text-green-600" : legal.score >= 60 ? "text-amber-500" : "text-red-500"
              }`}>
                {legal.score}
              </span>
              <span className="text-[10px] text-gray-400">/100</span>
              {legalErrors.length > 0 && (
                <div className="mt-1.5 text-[10px] text-red-500 font-medium">
                  {legalErrors.length} critique{legalErrors.length > 1 ? "s" : ""}
                </div>
              )}
            </>
          ) : (
            <span className="text-[10px] text-gray-400 mt-1 block">Non inclus</span>
          )}
        </button>
      </nav>

      {/* ── Contenu principal ───────────────────────────────────────────────── */}
      <div className="space-y-4 min-w-0">

      {/* ── Scores ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-8 justify-center md:justify-start">
          {seo && (
            <ScoreRing score={seo.score} label="Score visibilité" color={scoreColor(seo.score)} />
          )}
          {legal && (
            <ScoreRing score={legal.score} label="Score conformité" color={scoreColor(legal.score)} />
          )}
          {globalScore !== null && (
            <ScoreRing score={globalScore} label="Score global" color={scoreColor(globalScore)} />
          )}
          {legal && (
            <div className="flex flex-col justify-center gap-2">
              <p className="text-sm text-gray-500">Niveau de risque juridique</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${riskLevelColor(legal.riskLevel)}`}>
                {riskLevelLabel(legal.riskLevel)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Audit visibilité ────────────────────────────────────────────────── */}
      {seo && (
        <AccordionSection
          id="seo-section"
          title="Audit visibilité"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          accentBg="bg-blue-50"
          score={seo.score}
          errorCount={seoErrors.length}
          warningCount={seoWarnings.length}
          isOpen={seoOpen}
          onToggle={() => setSeoOpen((v) => !v)}
        >
          {/* Stats rapides */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4">
            {[
              { label: "Mots",       value: seo.content.wordCount },
              { label: "H1",         value: seo.content.h1Count },
              { label: "H2",         value: seo.content.h2Count },
              { label: "H3",         value: seo.content.h3Count },
              { label: "Sans alt",   value: seo.content.imagesWithoutAlt },
              { label: "Liens int.", value: seo.content.internalLinks },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Champ lexical */}
          {lexicalField && <LexicalFieldPanel lexicalField={lexicalField} />}

          {/* Points critiques */}
          {seoErrors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                Points critiques
              </h3>
              {seoErrors.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          )}

          {/* Avertissements */}
          {seoWarnings.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">
                Améliorations recommandées
              </h3>
              {seoWarnings.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          )}

          {/* Info & succès */}
          {seoInfos.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Points vérifiés
              </h3>
              {seoInfos.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          )}

          {/* Analyse IA SEO */}
          {seo.seoAiAnalysis && (
            <div className="bg-gray-900 rounded-xl p-6 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold">Analyse SEO &amp; GEO approfondie</h3>
              </div>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {seo.seoAiAnalysis}
              </div>
            </div>
          )}
        </AccordionSection>
      )}

      {/* ── Audit conformité ────────────────────────────────────────────────── */}
      <AccordionSection
        id="legal-section"
        title="Audit conformité"
        icon={<ShieldCheck className="h-5 w-5 text-zen-700" />}
        accentBg="bg-zen-50"
        score={legal?.score ?? null}
        errorCount={legalErrors.length}
        warningCount={legalWarnings.length}
        isOpen={legalOpen}
        onToggle={() => setLegalOpen((v) => !v)}
        subtitle={!legal ? "Non inclus dans ce plan" : undefined}
      >
        {legal ? (
          <>
            {/* Mentions check */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3 mt-4">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Vérification des mentions obligatoires
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: "Mentions légales", ok: legal.mentionsCheck.hasMentionsLegales },
                  { label: "Politique RGPD",   ok: legal.mentionsCheck.hasPolitiqueConfidentialite },
                  { label: "CGV",              ok: legal.mentionsCheck.hasCGV },
                  { label: "Gestion cookies",  ok: legal.mentionsCheck.hasCookiePolicy },
                  { label: "Numéro SIRET",     ok: legal.mentionsCheck.hasSiret },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                      item.ok
                        ? "bg-zen-50 border-zen-200 text-zen-800"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {item.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      : <XCircle className="h-3.5 w-3.5 shrink-0" />
                    }
                    {item.label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                La présence des pages légales est vérifiée par lien. Pour analyser leur{" "}
                <strong>contenu</strong> (SIRET, adresse, clauses…), lancez un diagnostic
                directement sur l&apos;URL de chaque page.
              </p>
            </div>

            {/* Formulations à surveiller */}
            {uniqueMatches.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                  Formulations à surveiller ({uniqueMatches.length})
                </h3>
                {uniqueMatches
                  .filter((m) => isPro || visibleMatchIds.has(m.ruleId))
                  .map((match) => <LegalMatchCard key={match.ruleId} match={match} />)}
              </div>
            )}

            {/* Points critiques (mentions manquantes) */}
            {legalErrors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                  Points critiques
                </h3>
                {legalErrors
                  .filter((i) => isPro || visibleIssueIds.has(i.id))
                  .map((issue) => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            )}

            {/* Points à améliorer */}
            {legalWarnings.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">
                  Points à améliorer
                </h3>
                {legalWarnings
                  .filter((i) => isPro || visibleIssueIds.has(i.id))
                  .map((issue) => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            )}

            {/* Bloc verrouillé freemium */}
            {legalHiddenCount > 0 && (
              <div className="relative">
                <div className="space-y-2 blur-sm pointer-events-none select-none" aria-hidden>
                  {Array.from({ length: Math.min(legalHiddenCount, 3) }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white h-20" />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                  <Lock className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    {legalHiddenCount} point{legalHiddenCount > 1 ? "s" : ""} juridique
                    {legalHiddenCount > 1 ? "s" : ""} supplémentaire{legalHiddenCount > 1 ? "s" : ""} identifié
                    {legalHiddenCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500 mb-4 text-center px-6">
                    Accédez au rapport juridique complet avec le plan Pro
                  </p>
                  <Link
                    href="/abonnement"
                    className="inline-flex items-center gap-2 bg-coral-500 text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-coral-600 transition-colors"
                  >
                    Voir le rapport complet
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Analyse IA juridique */}
            {legal.aiAnalysis && (
              <div className="bg-gray-900 rounded-xl p-6 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-semibold">Analyse approfondie par IA</h3>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {legal.aiAnalysis}
                </div>
              </div>
            )}

            {!legal.aiAnalysis && !isPro && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Analyse juridique par IA
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Obtenez une analyse nuancée et contextuelle de vos risques juridiques.
                  </p>
                </div>
                <Link
                  href="/abonnement"
                  className="shrink-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1 font-medium"
                >
                  Plan Pro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-zen-50 rounded-xl p-8 text-center mt-4">
            <ShieldCheck className="h-10 w-10 text-zen-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Audit juridique non inclus</h3>
            <p className="text-gray-600 text-sm mb-2">
              Votre plan gratuit inclut uniquement l&apos;audit SEO.
            </p>
            <p className="text-gray-500 text-xs mb-5">
              Passez au plan Pro pour identifier les formulations à risque, vérifier les mentions
              obligatoires et obtenir des recommandations personnalisées.
            </p>
            <Link
              href="/abonnement"
              className="inline-flex items-center gap-2 bg-coral-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-coral-600 transition-colors text-sm"
            >
              Voir les plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </AccordionSection>
      </div>{/* fin contenu principal */}
    </div>
  );
}
