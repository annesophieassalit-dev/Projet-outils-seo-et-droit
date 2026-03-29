import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Search,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm">—</span>;
  const color =
    score >= 80
      ? "text-green-700 bg-green-100"
      : score >= 60
      ? "text-amber-700 bg-amber-100"
      : score >= 40
      ? "text-orange-700 bg-orange-100"
      : "text-red-700 bg-red-100";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return null;
  const styles: Record<string, string> = {
    faible: "text-green-700 bg-green-100",
    modere: "text-amber-700 bg-amber-100",
    eleve: "text-orange-700 bg-orange-100",
    critique: "text-red-700 bg-red-100",
  };
  const labels: Record<string, string> = {
    faible: "Faible",
    modere: "Modéré",
    eleve: "Élevé",
    critique: "Critique",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[level] || "bg-gray-100 text-gray-600"}`}>
      {labels[level] || level}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: audits }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, profession, plan, audits_used_this_month")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("audits")
      .select(
        "id, url, status, seo_score, seo_grade, legal_score, legal_grade, legal_risk_level, global_score, created_at"
      )
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const plan = profile?.plan || "gratuit";
  const auditsUsed = profile?.audits_used_this_month || 0;
  const auditsLimit = plan === "gratuit" ? 1 : plan === "essentiel" ? 10 : null;
  const firstName = profile?.full_name?.split(" ")[0] || "vous";

  const completedAudits = audits?.filter((a) => a.status === "completed") || [];
  const avgSeo =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce((s, a) => s + (a.seo_score || 0), 0) /
            completedAudits.length
        )
      : null;
  const avgLegal =
    completedAudits.length > 0
      ? Math.round(
          completedAudits.reduce((s, a) => s + (a.legal_score || 0), 0) /
            completedAudits.length
        )
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile?.profession || "Praticien bien-être"} ·{" "}
            <span className="capitalize">{plan}</span>
          </p>
        </div>
        <Link
          href="/audit/nouveau"
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors text-sm font-semibold"
        >
          <Search className="h-4 w-4" />
          Nouvel audit
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Audits ce mois</p>
          <p className="text-2xl font-bold text-gray-900">
            {auditsUsed}
            {auditsLimit && (
              <span className="text-sm font-normal text-gray-400">
                /{auditsLimit}
              </span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Score SEO moyen
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {avgSeo !== null ? `${avgSeo}` : "—"}
            {avgSeo !== null && (
              <span className="text-sm font-normal text-gray-400">/100</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Score juridique moyen
          </p>
          {plan === "gratuit" ? (
            <p className="text-sm text-gray-400">Plan Essentiel requis</p>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {avgLegal !== null ? `${avgLegal}` : "—"}
              {avgLegal !== null && (
                <span className="text-sm font-normal text-gray-400">/100</span>
              )}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Total audits</p>
          <p className="text-2xl font-bold text-gray-900">
            {completedAudits.length}
          </p>
        </div>
      </div>

      {/* Upgrade banner */}
      {plan === "gratuit" && (
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-xl p-5 flex items-center justify-between text-white">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Activez l&apos;audit juridique
            </p>
            <p className="text-green-100 text-sm mt-0.5">
              Détectez les risques d&apos;exercice illégal et les mentions manquantes sur votre site.
            </p>
          </div>
          <Link
            href="/abonnement"
            className="shrink-0 bg-white text-green-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1"
          >
            Voir les plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Pro feature teaser */}
      {plan === "essentiel" && (
        <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between text-white">
          <div>
            <p className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Analyse juridique par IA disponible en Pro
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              Obtenez une analyse nuancée et contextuelle par Claude AI pour chaque audit.
            </p>
          </div>
          <Link
            href="/abonnement"
            className="shrink-0 bg-yellow-400 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-1"
          >
            Passer en Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Recent audits */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Derniers audits</h2>
          <Link
            href="/rapports"
            className="text-xs text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
          >
            Voir tout
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!audits || audits.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun audit pour le moment</p>
            <Link
              href="/audit/nouveau"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-green-700 font-medium hover:text-green-800"
            >
              Lancer votre premier audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {audits.map((audit) => (
              <Link
                key={audit.id}
                href={`/audit/${audit.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {audit.url}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(audit.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {audit.status === "running" ? (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      En cours…
                    </span>
                  ) : audit.status === "failed" ? (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Erreur
                    </span>
                  ) : (
                    <>
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <TrendingUp className="h-3 w-3" />
                          <ScoreBadge score={audit.seo_score} />
                        </div>
                        {audit.legal_score !== null && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <ShieldCheck className="h-3 w-3" />
                            <ScoreBadge score={audit.legal_score} />
                          </div>
                        )}
                      </div>
                      {audit.legal_risk_level && (
                        <RiskBadge level={audit.legal_risk_level} />
                      )}
                    </>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
