import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/trial";
import { ArrowLeft, ExternalLink, FileDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SeoScore, LegalScore } from "@/types/audit";
import AuditResultClient from "./AuditResultClient";

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

  const seo   = audit.seo_data   as SeoScore   | null;
  const legal = audit.legal_data as LegalScore | null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at")
    .eq("id", user!.id)
    .single();

  const { effectivePlan: plan } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  const isPro = plan === "pro";

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
          {isPro && (
            <Link
              href={`/audit/${id}/print`}
              target="_blank"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Télécharger PDF
            </Link>
          )}
        </div>
      </div>

      {/* Résultats — accordéon client */}
      <AuditResultClient
        seo={seo}
        legal={legal}
        globalScore={audit.global_score}
        auditId={id}
        isPro={isPro}
      />

      {/* Note de bas de page */}
      <p className="text-xs text-gray-400 text-center pb-4">
        Visible &amp; Conforme ne constitue pas une consultation juridique, un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
      </p>
    </div>
  );
}
