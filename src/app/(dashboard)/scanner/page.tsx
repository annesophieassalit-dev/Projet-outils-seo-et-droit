"use client";

import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, XCircle, Loader2,
  Copy, Check, ChevronDown, ChevronUp, Sparkles, Info,
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

// ─── Panneau abréviations ─────────────────────────────────────────────────────

const ABBREVIATIONS = [
  {
    abbr: "Dr",
    title: "Docteur",
    risk: "error" as const,
    avoid: "Dr [Prénom Nom]",
    use: "[Prénom Nom] + titre réel",
    why: "Réservé aux médecins et docteurs universitaires. Usage sans ce titre = délit pénal.",
    ref: "Art. 433-17 Code pénal",
  },
  {
    abbr: "Psy",
    title: "Psychologue / Psychothérapeute",
    risk: "error" as const,
    avoid: "psy, ma psy",
    use: "praticien en accompagnement émotionnel",
    why: "Abréviation de deux titres strictement réglementés (ADELI/ARS). Utilisé aussi pour le référencement, ce qui peut être considéré comme trompeur.",
    ref: "Art. 44 Loi 85-772 + Art. 52 Loi 2004-806",
  },
  {
    abbr: "Ostéo",
    title: "Ostéopathe",
    risk: "error" as const,
    avoid: "ostéo",
    use: "praticien en techniques ostéo-articulaires",
    why: "Ostéopathe est un titre protégé depuis 2014. « Ostéo » seul crée la même confusion dans la perception du public.",
    ref: "Décret n°2014-1043",
  },
  {
    abbr: "Kiné",
    title: "Kinésithérapeute",
    risk: "error" as const,
    avoid: "kiné",
    use: "praticien en mobilité / accompagnement corporel",
    why: "Titre réglementé nécessitant un diplôme d'État et une inscription à l'Ordre.",
    ref: "Art. L4321-1 CSP",
  },
  {
    abbr: "Chiro",
    title: "Chiropracteur",
    risk: "error" as const,
    avoid: "chiro",
    use: "votre titre complet exact",
    why: "Titre réglementé depuis la loi de 2002. L'abréviation hérite du même statut.",
    ref: "Art. 75 Loi 2002-303",
  },
  {
    abbr: "Ergo",
    title: "Ergothérapeute",
    risk: "warning" as const,
    avoid: "ergo",
    use: "praticien en accompagnement du mouvement / autonomie",
    why: "Profession de santé réglementée. À éviter si vous n'êtes pas titulaire du diplôme d'État.",
    ref: "Art. L4331-1 CSP",
  },
  {
    abbr: "Ortho",
    title: "Orthophoniste / Orthoptiste",
    risk: "warning" as const,
    avoid: "ortho",
    use: "votre titre complet exact",
    why: "Renvoie à deux professions de santé réglementées. L'abréviation peut créer une confusion.",
    ref: "Art. L4341-1 et L4342-1 CSP",
  },
];

function AbbreviationsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-900">
              Les abréviations — un risque souvent sous-estimé
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Si le titre complet est protégé, l&apos;abréviation l&apos;est aussi.
            </p>
          </div>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-orange-500 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-orange-500 shrink-0" />}
      </button>

      {open && (
        <div className="bg-white p-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Certaines abréviations correspondent à des professions réglementées. Même sans intention de créer une confusion,
            elles peuvent laisser croire que vous exercez une activité de santé reconnue par l&apos;État.
            Utilisées pour le référencement (ex : <em>psy</em> pour apparaître dans les recherches liées à la psychologie),
            elles peuvent être considérées comme trompeuses — et fragiliser à la fois votre conformité et votre visibilité Google.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 font-medium">
            🔑 Règle d&apos;or : si le titre complet est protégé, l&apos;abréviation l&apos;est aussi.
            Tous ces raccourcis héritent du statut juridique du titre d&apos;origine.
          </div>

          <div className="space-y-2">
            {ABBREVIATIONS.map((a) => (
              <div
                key={a.abbr}
                className={`rounded-xl border p-4 ${
                  a.risk === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      a.risk === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {a.abbr}
                    </span>
                    <span className="text-xs text-gray-500">{a.title}</span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{a.ref}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600 line-through">{a.avoid}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zen-600 shrink-0 mt-0.5" />
                    <span className="text-zen-800 font-medium">{a.use}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{a.why}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Lorsqu&apos;un internaute lit rapidement une page ou une fiche Google, il interprète les termes tels qu&apos;ils
            apparaissent. La prudence consiste à utiliser des formulations qui décrivent clairement votre pratique,
            sans laisser penser que vous exercez une profession réglementée.
          </p>
        </div>
      )}
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
          Collez n'importe quel texte — bio Instagram, post, article de blog, page de site, présentation d'activité —
          et détectez les formulations à risque instantanément.
        </p>
      </div>

      {/* Note contextuelle */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <span className="text-lg shrink-0">💡</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Important :</strong> aucun mot n'est interdit seul — c'est le <strong>contexte et l'interprétation</strong> qui créent le risque juridique.
          Le scanner signale les termes à surveiller ; à vous d'évaluer si votre formulation globale est problématique.
        </p>
      </div>

      {/* Abréviations à risque */}
      <AbbreviationsPanel />

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
