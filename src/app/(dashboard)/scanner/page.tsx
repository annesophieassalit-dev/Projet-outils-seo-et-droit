"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle, Loader2,
  Copy, Check, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import type { ScannerResult, ScannerAlert, RiskLevel } from "@/types/scanner";
import Link from "next/link";

// ─── Helpers visuels ──────────────────────────────────────────────────────────

function riskEmoji(level: RiskLevel) {
  switch (level) {
    case "critique": return "🔴";
    case "vigilance": return "🟠";
    case "neutre": return "🟡";
    case "conforme": return "🟢";
  }
}

function riskLabel(level: RiskLevel) {
  switch (level) {
    case "critique": return "Critique";
    case "vigilance": return "Vigilance";
    case "neutre": return "À surveiller";
    case "conforme": return "Conforme";
  }
}

function riskColors(level: RiskLevel) {
  switch (level) {
    case "critique": return "bg-red-50 border-red-200 text-red-800";
    case "vigilance": return "bg-orange-50 border-orange-200 text-orange-800";
    case "neutre": return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case "conforme": return "bg-zen-50 border-zen-200 text-zen-800";
  }
}

function globalBannerColors(level: RiskLevel) {
  switch (level) {
    case "critique": return "bg-red-600 text-white";
    case "vigilance": return "bg-orange-500 text-white";
    case "neutre": return "bg-yellow-500 text-white";
    case "conforme": return "bg-zen-600 text-white";
  }
}

// ─── Composant alerte individuelle ───────────────────────────────────────────

function AlertCard({ alert, index }: { alert: ScannerAlert; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${riskColors(alert.riskLevel)}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 text-left"
      >
        <span className="text-xl shrink-0">{riskEmoji(alert.riskLevel)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">« {alert.term} »</span>
            <span className="text-xs opacity-70">{alert.category}</span>
          </div>
          {alert.reformulation && (
            <p className="text-sm mt-0.5 opacity-80">
              → {alert.reformulation}
            </p>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
          <div className="bg-white bg-opacity-60 rounded-lg px-3 py-2 text-sm italic">
            {alert.context}
          </div>
          {alert.legalReference && (
            <p className="text-xs opacity-60">Référence : {alert.legalReference}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reformulations ───────────────────────────────────────────────────────────

function ReformulationCard({ original, safe, explanation }: {
  original: string; safe: string; explanation: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white space-y-2">
      <div className="flex items-start gap-2 text-sm">
        <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
        <span className="line-through text-gray-400">{original}</span>
      </div>
      <div className="flex items-start gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0 mt-0.5" />
        <span className="text-zen-800 font-medium">{safe}</span>
      </div>
      <p className="text-xs text-gray-500 pl-6">{explanation}</p>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ScannerPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScannerResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"alertes" | "reformulations" | "texte_corrige">("alertes");

  async function handleScan() {
    if (text.trim().length < 10) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, useAI: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setActiveTab("alertes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const critiques = result?.alerts.filter(a => a.riskLevel === "critique") || [];
  const vigilances = result?.alerts.filter(a => a.riskLevel === "vigilance") || [];
  const autres = result?.alerts.filter(a => a.riskLevel === "neutre") || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scanner de texte</h1>
        <p className="text-gray-500 text-sm mt-1">
          Collez n'importe quel texte — bio, post, page web, description de programme —
          et détectez les formulations à risque instantanément.
        </p>
      </div>

      {/* Zone de saisie */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Collez ici votre texte à analyser…

Exemples : bio Instagram, présentation de vos séances, texte de votre site, description d'un programme, post LinkedIn..."
          className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-zen-600 resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{text.length} caractères</span>
          <button
            onClick={handleScan}
            disabled={loading || text.trim().length < 10}
            className="bg-zen-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-zen-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
            {loading ? "Analyse en cours…" : "Analyser ce texte"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Résultats */}
      {result && (
        <div className="space-y-4">

          {/* Bandeau global */}
          <div className={`rounded-2xl p-5 ${globalBannerColors(result.globalRisk)}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{riskEmoji(result.globalRisk)}</span>
              <div>
                <p className="font-bold text-lg">
                  Niveau de vigilance : {riskLabel(result.globalRisk)}
                </p>
                <p className="text-sm opacity-90">{result.summary}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              {critiques.length > 0 && (
                <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-lg font-medium">
                  🔴 {critiques.length} critique{critiques.length > 1 ? "s" : ""}
                </span>
              )}
              {vigilances.length > 0 && (
                <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-lg font-medium">
                  🟠 {vigilances.length} vigilance{vigilances.length > 1 ? "s" : ""}
                </span>
              )}
              {result.alerts.length === 0 && (
                <span className="bg-white bg-opacity-20 px-2.5 py-1 rounded-lg font-medium">
                  ✓ Aucun terme problématique
                </span>
              )}
            </div>
          </div>

          {/* Onglets */}
          {result.alerts.length > 0 && (
            <>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {(["alertes", "reformulations"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab === "alertes"
                      ? `Alertes (${result.alerts.length})`
                      : `Reformulations (${result.reformulations.length})`}
                  </button>
                ))}
              </div>

              {/* Alertes */}
              {activeTab === "alertes" && (
                <div className="space-y-2">
                  {critiques.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide px-1">
                        Termes critiques — à corriger en priorité
                      </p>
                      {critiques.map((alert, i) => (
                        <AlertCard key={i} alert={alert} index={i} />
                      ))}
                    </>
                  )}
                  {vigilances.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide px-1 mt-3">
                        Points de vigilance — reformulation conseillée
                      </p>
                      {vigilances.map((alert, i) => (
                        <AlertCard key={i} alert={alert} index={i} />
                      ))}
                    </>
                  )}
                  {autres.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide px-1 mt-3">
                        À surveiller selon le contexte
                      </p>
                      {autres.map((alert, i) => (
                        <AlertCard key={i} alert={alert} index={i} />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Reformulations */}
              {activeTab === "reformulations" && (
                <div className="space-y-3">
                  {result.reformulations.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">
                      Aucune reformulation disponible pour ces termes.
                    </p>
                  ) : (
                    result.reformulations.map((ref, i) => (
                      <ReformulationCard key={i} {...ref} />
                    ))
                  )}

                  {/* Teaser analyse IA */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Reformulations personnalisées par IA
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        L'IA reformule tout votre texte en tenant compte du contexte complet.
                      </p>
                    </div>
                    <Link
                      href="/abonnement"
                      className="shrink-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Plan Pro
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Texte corrigé (si IA) */}
          {result.cleanedText && (
            <div className="bg-zen-50 border border-zen-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-zen-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Version corrigée par l'IA
                </p>
                <button
                  onClick={() => copyText(result.cleanedText!)}
                  className="text-xs flex items-center gap-1 text-zen-700 hover:text-zen-900"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
              <p className="text-sm text-zen-800 leading-relaxed whitespace-pre-line">
                {result.cleanedText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Texte conforme */}
      {result && result.alerts.length === 0 && (
        <div className="bg-zen-50 border border-zen-200 rounded-2xl p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-zen-600 mx-auto mb-3" />
          <p className="font-semibold text-zen-900">Texte conforme</p>
          <p className="text-zen-700 text-sm mt-1">
            Aucun terme problématique détecté. Ce texte adopte une communication prudente.
          </p>
        </div>
      )}

      {/* Note de bas de page */}
      <p className="text-xs text-gray-400 text-center">
        Visible & Conforme ne constitue pas une consultation juridique, un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
      </p>
    </div>
  );
}
