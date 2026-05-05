"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, Copy, Check, RefreshCw,
  ChevronDown, Lock, ArrowRight,
} from "lucide-react";
import type { ContentType, GeneratedContent } from "@/types/scanner";
import { CONTENT_TYPE_LABELS } from "@/types/scanner";
import Link from "next/link";

// ─── Constantes ───────────────────────────────────────────────────────────────

const CONTENT_TYPES: ContentType[] = [
  "post_instagram",
  "post_linkedin",
  "post_facebook",
  "post_tiktok",
  "post_threads",
  "bio_instagram",
  "presentation_activite",
  "article_blog",
  "fiche_google",
  "accroche_site",
];

const THEMES = [
  { id: "stress", label: "Stress & anxiété" },
  { id: "sommeil", label: "Sommeil" },
  { id: "fatigue", label: "Fatigue & énergie" },
  { id: "emotions", label: "Émotions" },
  { id: "confiance", label: "Confiance en soi" },
  { id: "douleurs", label: "Tensions & douleurs" },
  { id: "digestion", label: "Digestion & alimentation" },
  { id: "burn_out", label: "Épuisement professionnel" },
  { id: "parentalite", label: "Parentalité" },
  { id: "transition", label: "Transitions de vie" },
  { id: "feminite", label: "Cycle féminin" },
  { id: "enfants", label: "Accompagnement enfants" },
];

const TONES = [
  { id: "chaleureux", label: "Chaleureux", description: "Humain et proche" },
  { id: "professionnel", label: "Professionnel", description: "Sobre et crédible" },
  { id: "sobre", label: "Épuré", description: "Minimaliste, va à l'essentiel" },
] as const;

// ─── Composant résultat ───────────────────────────────────────────────────────

function ResultCard({
  result, profession, onVariant, variantLoading,
}: {
  result: GeneratedContent;
  profession: string;
  onVariant: () => void;
  variantLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showNote, setShowNote] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {CONTENT_TYPE_LABELS[result.contentType]}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNote(!showNote)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Note conformité
            <ChevronDown className={`h-3 w-3 transition-transform ${showNote ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={onVariant}
            disabled={variantLoading}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${variantLoading ? "animate-spin" : ""}`} />
            Variante
          </button>
          <button
            onClick={copy}
            className="text-xs flex items-center gap-1 text-zen-700 hover:text-zen-900"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {result.content}
        </p>
      </div>

      {showNote && (
        <div className="px-5 py-3 bg-zen-50 border-t border-zen-100">
          <p className="text-xs text-zen-700">
            <strong>Note de conformité :</strong> {result.complianceNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const INTENTIONS = [
  { id: "faire_connaitre", label: "Faire connaître mon approche", emoji: "🌱" },
  { id: "inviter_contact", label: "Inviter à me contacter", emoji: "✉️" },
  { id: "expliquer", label: "Expliquer ce que je propose", emoji: "💡" },
] as const;

type Intention = typeof INTENTIONS[number]["id"];

export default function GenerateurPage() {
  const [contentType, setContentType] = useState<ContentType>("post_instagram");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [tone, setTone] = useState<"chaleureux" | "professionnel" | "sobre">("chaleureux");
  const [intention, setIntention] = useState<Intention>("faire_connaitre");
  const [specificites, setSpecificites] = useState("");
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  function toggleTheme(id: string) {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    setUpgradeRequired(false);

    try {
      const res = await fetch("/api/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          profession,
          themes: selectedThemes,
          tone,
          intention,
          specificites: specificites || undefined,
        }),
      });
      const data = await res.json();

      if (data.upgradeRequired) {
        setUpgradeRequired(true);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération.");
    } finally {
      setLoading(false);
    }
  }

  async function generateVariant() {
    if (!result) return;
    setVariantLoading(true);
    try {
      const res = await fetch("/api/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "variant",
          original: result.content,
          contentType: result.contentType,
          profession,
        }),
      });
      const data = await res.json();
      if (data.variant) {
        setResult({
          ...result,
          content: data.variant,
          complianceNote: result.complianceNote,
        });
      }
    } catch { /* silencieux */ }
    finally { setVariantLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          Générateur de contenus safe
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Créez des contenus professionnels et juridiquement conformes, adaptés à votre activité.
          L'IA respecte les règles de communication prudente à chaque génération.
        </p>
      </div>

      {/* Mise à niveau requise */}
      {upgradeRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <Lock className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">Fonctionnalité Pro</h2>
          <p className="text-gray-600 text-sm mb-4">
            Le générateur de contenus est disponible avec le plan Pro à 19€/mois.
          </p>
          <Link
            href="/abonnement"
            className="inline-flex items-center gap-2 bg-coral-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-coral-600 transition-colors text-sm"
          >
            Passer au plan Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Formulaire */}
        <div className="md:col-span-2 space-y-5">

          {/* Type de contenu */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Type de contenu</h3>
            <div className="space-y-1.5">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    contentType === type
                      ? "bg-zen-100 text-zen-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {CONTENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Profession */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Votre activité</h3>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex : Naturopathe, Coach de vie, Sophrologue…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600"
            />
          </div>
        </div>

        {/* Paramètres + résultat */}
        <div className="md:col-span-3 space-y-5">

          {/* Thèmes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Thèmes que vous accompagnez
              <span className="text-gray-400 font-normal ml-1">(sélectionnez plusieurs)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => toggleTheme(theme.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedThemes.includes(theme.id)
                      ? "bg-zen-700 text-white border-zen-700"
                      : "bg-white text-gray-600 border-gray-200 hover:border-zen-400"
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Ton souhaité</h3>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    tone === t.id
                      ? "border-zen-600 bg-zen-50 text-zen-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Intention */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Ce contenu doit surtout…</h3>
            <div className="space-y-2">
              {INTENTIONS.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setIntention(i.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    intention === i.id
                      ? "border-zen-600 bg-zen-50 text-zen-900 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{i.emoji}</span>
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {/* Précisions libres */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Précisions supplémentaires
              <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
            </h3>
            <textarea
              value={specificites}
              onChange={(e) => setSpecificites(e.target.value)}
              rows={3}
              placeholder="Ex : je travaille principalement avec des femmes, j'ai une approche corporelle, je propose des séances en ligne et à Lyon, je suis certifiée IRNHE..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 resize-none"
            />
          </div>

          {/* Bouton générer */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full bg-zen-700 text-white py-3.5 rounded-xl font-semibold hover:bg-zen-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Génération en cours…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Générer ce contenu</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <ResultCard
          result={result}
          profession={profession}
          onVariant={generateVariant}
          variantLoading={variantLoading}
        />
      )}

      {/* Note de fond */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
        <strong>Principe de conception :</strong> tous les contenus générés évitent les promesses de résultats,
        les termes médicaux et les formulations commerciales agressives. L&apos;objectif est une communication
        crédible, professionnelle et efficace pour votre visibilité.
      </div>

      {/* Disclaimer juridique */}
      <p className="text-xs text-gray-400 text-center">
        Visible & Conforme ne constitue pas une consultation juridique, un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
      </p>
    </div>
  );
}
