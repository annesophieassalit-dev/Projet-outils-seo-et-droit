import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  ShieldCheck,
  Search,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

function ScorePill({ score, icon: Icon }: { score: number | null; icon: React.ElementType }) {
  if (score === null) return null;
  const color =
    score >= 80
      ? "text-green-700 bg-green-100"
      : score >= 60
      ? "text-amber-700 bg-amber-100"
      : "text-red-700 bg-red-100";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${color}`}>
      <Icon className="h-3 w-3" />
      {score}
    </span>
  );
}

export default async function RapportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: audits } = await supabase
    .from("audits")
    .select(
      "id, url, status, seo_score, legal_score, legal_risk_level, global_score, created_at, completed_at"
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const riskLabels: Record<string, string> = {
    faible: "Risque faible",
    modere: "Risque modéré",
    eleve: "Risque élevé",
    critique: "Risque critique",
  };
  const riskColors: Record<string, string> = {
    faible: "text-green-700 bg-green-100",
    modere: "text-amber-700 bg-amber-100",
    eleve: "text-orange-700 bg-orange-100",
    critique: "text-red-700 bg-red-100",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes rapports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Historique de tous vos audits
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

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {!audits || audits.length === 0 ? (
          <div className="py-16 text-center">
            <Search className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Aucun audit pour le moment</p>
            <Link
              href="/audit/nouveau"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-green-700 font-medium hover:text-green-800"
            >
              Lancer votre premier audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium uppercase tracking-wide">
              <div className="col-span-5">Site</div>
              <div className="col-span-2 text-center">SEO</div>
              <div className="col-span-2 text-center">Juridique</div>
              <div className="col-span-2">Risque</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-gray-50">
              {audits.map((audit) => (
                <Link
                  key={audit.id}
                  href={`/audit/${audit.id}`}
                  className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="col-span-5 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {audit.url}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {formatDate(audit.created_at)}
                    </p>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {audit.status === "running" ? (
                      <span className="text-xs text-blue-500">En cours</span>
                    ) : audit.status === "failed" ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : (
                      <ScorePill score={audit.seo_score} icon={TrendingUp} />
                    )}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {audit.legal_score !== null ? (
                      <ScorePill score={audit.legal_score} icon={ShieldCheck} />
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  <div className="col-span-2">
                    {audit.legal_risk_level ? (
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${riskColors[audit.legal_risk_level] || "bg-gray-100 text-gray-600"}`}
                      >
                        {riskLabels[audit.legal_risk_level] || audit.legal_risk_level}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
