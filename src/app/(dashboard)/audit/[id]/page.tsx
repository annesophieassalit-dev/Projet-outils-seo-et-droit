import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { formatDate, riskLevelColor, riskLevelLabel } from "@/lib/utils";
import type { AuditIssue, LegalRuleMatch, SeoScore, LegalScore } from "@/types/audit";

// ─── Composants locaux ────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48" cy="48" r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth="8"
          />
          <circle
            cx="48" cy="48" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
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

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "error":
      return <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0 mt-0.5" />;
    default:
      return <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-zen-100 text-zen-700",
    info: "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = {
    error: "Critique",
    warning: "Avertissement",
    success: "Conforme",
    info: "Info",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[severity] || "bg-gray-100 text-gray-600"}`}>
      {labels[severity] || severity}
    </span>
  );
}

function IssueCard({ issue }: { issue: AuditIssue }) {
  if (issue.severity === "success") {
    return (
      <div className="flex items-start gap-3 py-3 px-4 bg-zen-50/50 rounded-lg border border-zen-100">
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{issue.title}</p>
          {issue.excerpt && (
            <p className="text-xs text-gray-400 mt-0.5 italic truncate">
              {issue.excerpt}
            </p>
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

function LegalMatchCard({ match }: { match: LegalRuleMatch }) {
  const categoryLabels: Record<string, string> = {
    exercice_illegal: "Exercice illégal de la médecine",
    confusion_professionnelle: "Confusion professionnelle",
    mentions_obligatoires: "Mentions obligatoires",
    publicite_mensongere: "Publicité trompeuse",
    protection_consommateur: "Protection consommateur",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-start gap-3">
        <SeverityIcon severity={match.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">
              Terme détecté : «&nbsp;{match.term}&nbsp;»
            </p>
            <SeverityBadge severity={match.severity} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {categoryLabels[match.category] || match.category}
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
        <p className="text-xs text-gray-400">
          Référence : {match.legalReference}
        </p>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default async function AuditResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: audit } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!audit) notFound();

  const seo = audit.seo_data as SeoScore | null;
  const legal = audit.legal_data as LegalScore | null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const plan = profile?.plan || "gratuit";

  // Séparer les issues par sévérité pour l'affichage
  const seoErrors = seo?.issues.filter((i) => i.severity === "error") || [];
  const seoWarnings = seo?.issues.filter((i) => i.severity === "warning") || [];
  const seoInfos = seo?.issues.filter((i) => i.severity === "info" || i.severity === "success") || [];

  const legalErrors = legal?.issues.filter((i) => i.severity === "error") || [];
  const legalWarnings = legal?.issues.filter((i) => i.severity === "warning") || [];

  // Dédupliquer les matches
  const uniqueMatches = legal?.matches
    ? Array.from(
        new Map(legal.matches.map((m) => [m.ruleId, m])).values()
      )
    : [];

  // Freemium : limiter à 7 points visibles pour les non-Pro
  const FREE_LIMIT = 7;
  const allIssues = [...seoErrors, ...seoWarnings, ...legalErrors, ...legalWarnings, ...uniqueMatches];
  const totalIssues = allIssues.length;
  const hiddenCount = plan !== "pro" ? Math.max(0, totalIssues - FREE_LIMIT) : 0;
  let shownSoFar = 0;
  function canShow(): boolean {
    if (plan === "pro") return true;
    if (shownSoFar < FREE_LIMIT) { shownSoFar++; return true; }
    return false;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              Audit du{" "}
              <time className="font-normal text-gray-500 text-base">
                {formatDate(audit.created_at)}
              </time>
            </h1>
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zen-700 hover:text-zen-800 flex items-center gap-1 mt-1"
            >
              {audit.url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-8 justify-center md:justify-start">
          {seo && (
            <ScoreRing
              score={seo.score}
              label="Score SEO"
              color={
                seo.score >= 80
                  ? "#16a34a"
                  : seo.score >= 60
                  ? "#d97706"
                  : "#dc2626"
              }
            />
          )}
          {legal && (
            <ScoreRing
              score={legal.score}
              label="Score juridique"
              color={
                legal.score >= 80
                  ? "#16a34a"
                  : legal.score >= 60
                  ? "#d97706"
                  : "#dc2626"
              }
            />
          )}
          {audit.global_score !== null && (
            <ScoreRing
              score={audit.global_score}
              label="Score global"
              color={
                audit.global_score >= 80
                  ? "#16a34a"
                  : audit.global_score >= 60
                  ? "#d97706"
                  : "#dc2626"
              }
            />
          )}

          {legal && (
            <div className="flex flex-col justify-center gap-2">
              <p className="text-sm text-gray-500">Niveau de risque juridique</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${riskLevelColor(legal.riskLevel)}`}
              >
                {riskLevelLabel(legal.riskLevel)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Résultats SEO */}
      {seo && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Audit SEO
            </h2>
            <span className="text-sm text-gray-400">
              {seoErrors.length} critique{seoErrors.length !== 1 ? "s" : ""} ·{" "}
              {seoWarnings.length} avertissement{seoWarnings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Stats rapides SEO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Mots de contenu", value: seo.content.wordCount },
              { label: "Images sans alt", value: seo.content.imagesWithoutAlt },
              { label: "H1", value: seo.content.h1Count },
              { label: "Liens internes", value: seo.content.internalLinks },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Issues critiques */}
          {seoErrors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                Points critiques
              </h3>
              {seoErrors.filter(() => canShow()).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {/* Avertissements */}
          {seoWarnings.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                Améliorations recommandées
              </h3>
              {seoWarnings.filter(() => canShow()).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {/* Info et succès */}
          {seoInfos.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Points conformes
              </h3>
              {seoInfos.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Résultats juridiques */}
      {legal ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zen-700" />
            <h2 className="text-lg font-bold text-gray-900">
              Audit juridique
            </h2>
            <span className="text-sm text-gray-400">
              {legalErrors.length} critique{legalErrors.length !== 1 ? "s" : ""} ·{" "}
              {legalWarnings.length} avertissement{legalWarnings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Mentions check */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Vérification des mentions obligatoires
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Mentions légales", ok: legal.mentionsCheck.hasMentionsLegales },
                { label: "Politique RGPD", ok: legal.mentionsCheck.hasPolitiqueConfidentialite },
                { label: "CGV", ok: legal.mentionsCheck.hasCGV },
                { label: "Droit de rétractation", ok: legal.mentionsCheck.hasDroitRetractation },
                { label: "Gestion cookies", ok: legal.mentionsCheck.hasCookiePolicy },
                { label: "Numéro SIRET", ok: legal.mentionsCheck.hasSiret },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                    item.ok
                      ? "bg-zen-50 border-zen-200 text-zen-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {item.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Termes détectés */}
          {uniqueMatches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                Termes à risque détectés ({uniqueMatches.length})
              </h3>
              {uniqueMatches.filter(() => canShow()).map((match) => (
                <LegalMatchCard key={match.ruleId} match={match} />
              ))}
            </div>
          )}

          {/* Issues de mentions */}
          {legalErrors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                Points critiques
              </h3>
              {legalErrors
                .filter((i) => !i.id.startsWith("legal-EI") && !i.id.startsWith("legal-CP"))
                .filter(() => canShow())
                .map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
            </div>
          )}

          {legalWarnings.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                Points à améliorer
              </h3>
              {legalWarnings.filter(() => canShow()).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}

          {/* Bloc verrouillé — freemium */}
          {hiddenCount > 0 && (
            <div className="relative">
              {/* Cartes fantômes floutées */}
              <div className="space-y-2 blur-sm pointer-events-none select-none" aria-hidden>
                {Array.from({ length: Math.min(hiddenCount, 3) }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white h-20" />
                ))}
              </div>
              {/* CTA par-dessus */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <Lock className="h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {hiddenCount} point{hiddenCount > 1 ? "s" : ""} supplémentaire{hiddenCount > 1 ? "s" : ""} identifié{hiddenCount > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-500 mb-4 text-center px-6">
                  Accédez au rapport complet avec le plan Pro
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

          {/* Analyse IA */}
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

          {!legal.aiAnalysis && plan !== "pro" && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between">
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
        </section>
      ) : (
        /* Plan gratuit → teaser juridique */
        <section className="bg-zen-50 border border-zen-200 rounded-2xl p-8 text-center">
          <ShieldCheck className="h-12 w-12 text-zen-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Audit juridique non inclus
          </h2>
          <p className="text-gray-600 mb-2">
            Votre plan gratuit inclut uniquement l&apos;audit SEO.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Passez au plan Essentiel pour vérifier les termes interdits,
            les mentions obligatoires, et les risques juridiques de votre site.
          </p>
          <Link
            href="/abonnement"
            className="inline-flex items-center gap-2 bg-coral-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-coral-600 transition-colors"
          >
            Voir les plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Note de bas de page */}
      <p className="text-xs text-gray-400 text-center">
        LexZen ne constitue pas une consultation juridique, un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
      </p>
    </div>
  );
}
