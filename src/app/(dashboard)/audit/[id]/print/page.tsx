"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate, riskLevelLabel } from "@/lib/utils";
import type { SeoScore, LegalScore, AuditIssue, LegalRuleMatch } from "@/types/audit";

function severityLabel(s: string) {
  return s === "error" ? "Critique" : s === "warning" ? "Avertissement" : s === "success" ? "Conforme" : "Info";
}
function categoryLabel(c: string) {
  const map: Record<string, string> = {
    exercice_illegal: "Exercice illégal de la médecine",
    confusion_professionnelle: "Confusion professionnelle",
    mentions_obligatoires: "Mentions obligatoires",
    publicite_mensongere: "Publicité trompeuse",
    protection_consommateur: "Protection consommateur",
  };
  return map[c] || c;
}

export default function AuditPrintPage() {
  const params = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("audits")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();
      setAudit(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="p-8 text-gray-500">Chargement…</div>;
  if (!audit) return <div className="p-8 text-gray-500">Rapport introuvable.</div>;

  const seo = audit.seo_data as SeoScore | null;
  const legal = audit.legal_data as LegalScore | null;
  const uniqueMatches = legal?.matches
    ? Array.from(new Map(legal.matches.map((m: LegalRuleMatch) => [m.ruleId, m])).values())
    : [];

  const seoErrors = seo?.issues.filter((i: AuditIssue) => i.severity === "error") || [];
  const seoWarnings = seo?.issues.filter((i: AuditIssue) => i.severity === "warning") || [];
  const seoSuccess = seo?.issues.filter((i: AuditIssue) => i.severity === "success" || i.severity === "info") || [];
  const legalErrors = legal?.issues.filter((i: AuditIssue) => i.severity === "error") || [];
  const legalWarnings = legal?.issues.filter((i: AuditIssue) => i.severity === "warning") || [];

  return (
    <div className="print-page bg-white min-h-screen p-10 max-w-3xl mx-auto font-sans text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { padding: 0; }
        }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; margin-top: 24px; }
        .issue-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; }
        .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
        .badge-error { background: #fee2e2; color: #b91c1c; }
        .badge-warning { background: #fef3c7; color: #b45309; }
        .badge-success { background: #ecfdf5; color: #065f46; }
        .score-box { display: inline-block; width: 72px; text-align: center; padding: 12px 8px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb; margin-right: 12px; }
        .score-number { font-size: 28px; font-weight: 800; }
        .check-row { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 6px 10px; border-radius: 6px; margin-bottom: 4px; }
        .check-ok { background: #ecfdf5; color: #065f46; }
        .check-ko { background: #fef2f2; color: #991b1b; }
      `}</style>

      {/* En-tête de marque */}
      <div style={{ borderBottom: "2px solid #247551", paddingBottom: 20, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#247551" }}>Visible & Conforme</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>visibleetconforme.fr</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Rapport d&apos;audit</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{formatDate(audit.created_at as string)}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#374151" }}>
          <strong>URL analysée :</strong>{" "}
          <span style={{ color: "#247551" }}>{audit.url as string}</span>
        </div>
      </div>

      {/* Bouton imprimer */}
      <div className="no-print" style={{ marginBottom: 24 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#e86870",
            color: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Télécharger en PDF
        </button>
        <span style={{ marginLeft: 12, fontSize: 12, color: "#9ca3af" }}>
          Dans la boîte de dialogue d&apos;impression, choisissez &laquo; Enregistrer en PDF &raquo;
        </span>
      </div>

      {/* Scores */}
      <div style={{ marginBottom: 28 }}>
        <p className="section-title">Scores</p>
        <div>
          {seo && (
            <span className="score-box">
              <div className="score-number" style={{ color: seo.score >= 80 ? "#16a34a" : seo.score >= 60 ? "#d97706" : "#dc2626" }}>
                {seo.score}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>SEO</div>
            </span>
          )}
          {legal && (
            <span className="score-box">
              <div className="score-number" style={{ color: legal.score >= 80 ? "#16a34a" : legal.score >= 60 ? "#d97706" : "#dc2626" }}>
                {legal.score}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Juridique</div>
            </span>
          )}
          {audit.global_score !== null && (
            <span className="score-box">
              <div className="score-number" style={{ color: (audit.global_score as number) >= 80 ? "#16a34a" : (audit.global_score as number) >= 60 ? "#d97706" : "#dc2626" }}>
                {audit.global_score as number}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Global</div>
            </span>
          )}
          {legal && (
            <span className="score-box" style={{ width: "auto", padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Niveau de risque</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{riskLevelLabel(legal.riskLevel)}</div>
            </span>
          )}
        </div>
      </div>

      {/* SEO */}
      {seo && (
        <>
          <p className="section-title" style={{ color: "#1d4ed8" }}>Audit SEO</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Mots", value: seo.content.wordCount },
              { label: "Images sans alt", value: seo.content.imagesWithoutAlt },
              { label: "H1", value: seo.content.h1Count },
              { label: "Liens internes", value: seo.content.internalLinks },
            ].map((s) => (
              <div key={s.label} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {seoErrors.map((i: AuditIssue) => (
            <div key={i.id} className="issue-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{i.title}</strong>
                <span className="badge badge-error">{severityLabel(i.severity)}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{i.description}</p>
              {i.recommendation && <p style={{ fontSize: 12, color: "#047857", margin: "6px 0 0" }}>→ {i.recommendation}</p>}
            </div>
          ))}
          {seoWarnings.map((i: AuditIssue) => (
            <div key={i.id} className="issue-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{i.title}</strong>
                <span className="badge badge-warning">{severityLabel(i.severity)}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{i.description}</p>
              {i.recommendation && <p style={{ fontSize: 12, color: "#047857", margin: "6px 0 0" }}>→ {i.recommendation}</p>}
            </div>
          ))}
          {seoSuccess.length > 0 && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              ✓ {seoSuccess.length} point{seoSuccess.length > 1 ? "s" : ""} conforme{seoSuccess.length > 1 ? "s" : ""} détecté{seoSuccess.length > 1 ? "s" : ""}
            </div>
          )}
        </>
      )}

      {/* Juridique */}
      {legal && (
        <>
          <p className="section-title" style={{ color: "#247551", marginTop: 32 }}>Audit juridique</p>

          {/* Mentions */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Mentions obligatoires</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {[
                { label: "Mentions légales", ok: legal.mentionsCheck.hasMentionsLegales },
                { label: "Politique RGPD", ok: legal.mentionsCheck.hasPolitiqueConfidentialite },
                { label: "CGV", ok: legal.mentionsCheck.hasCGV },
                { label: "Gestion cookies", ok: legal.mentionsCheck.hasCookiePolicy },
                { label: "Numéro SIRET", ok: legal.mentionsCheck.hasSiret },
              ].map((item) => (
                <div key={item.label} className={`check-row ${item.ok ? "check-ok" : "check-ko"}`}>
                  {item.ok ? "✓" : "✗"} {item.label}
                </div>
              ))}
            </div>
          </div>

          {uniqueMatches.map((m: LegalRuleMatch) => (
            <div key={m.ruleId} className="issue-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>Terme : «&nbsp;{m.term}&nbsp;»</strong>
                <span className={`badge ${m.severity === "error" ? "badge-error" : "badge-warning"}`}>{severityLabel(m.severity)}</span>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{categoryLabel(m.category)}</p>
              <p style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", margin: "0 0 6px" }}>{m.context}</p>
              <p style={{ fontSize: 12, color: "#047857", margin: 0 }}>→ {m.recommendation}</p>
              {m.legalReference && <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>{m.legalReference}</p>}
            </div>
          ))}

          {[...legalErrors, ...legalWarnings].map((i: AuditIssue) => (
            <div key={i.id} className="issue-card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{i.title}</strong>
                <span className={`badge ${i.severity === "error" ? "badge-error" : "badge-warning"}`}>{severityLabel(i.severity)}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{i.description}</p>
              {i.recommendation && <p style={{ fontSize: 12, color: "#047857", margin: "6px 0 0" }}>→ {i.recommendation}</p>}
            </div>
          ))}

          {legal.aiAnalysis && (
            <div style={{ background: "#1f2937", color: "#e5e7eb", borderRadius: 10, padding: "14px 16px", marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>✦ Analyse approfondie par IA</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-line", margin: 0 }}>{legal.aiAnalysis}</p>
            </div>
          )}
        </>
      )}

      {/* Pied de page */}
      <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 40, paddingTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#247551" }}>Visible & Conforme</span>
          <span style={{ fontSize: 10, color: "#9ca3af" }}>visibleetconforme.fr</span>
        </div>
        <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 6, lineHeight: 1.5 }}>
          Ce rapport est généré automatiquement. Visible & Conforme ne constitue pas une consultation juridique,
          un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
        </p>
      </div>
    </div>
  );
}
