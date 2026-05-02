"use client";

import { useState } from "react";
import { Sparkles, Wand2, Copy, Check, Download, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

type Slide = { title: string; bold?: string; paragraphs?: string[]; sources?: string; is_last?: boolean };
type Generated = { style: string; slides: Slide[]; caption?: string };

const TOPIC_SUGGESTIONS = [
  "Les cookies et le RGPD sur votre site",
  "Google My Business et conformité juridique",
  "Politique de confidentialité pour praticiens",
  "Droits à l'image de vos clients",
  "Les avis Google et le droit",
  "Newsletter et consentement RGPD",
  "DGCCRF et allégations bien-être",
  "Mentions légales site web",
];

export default function GenererPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Generated | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState<"caption" | "json" | null>(null);

  async function generate(autoTopic = false) {
    if (!autoTopic && !topic.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), autoTopic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.carousel);
      setRawJson(data.raw);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, key: "caption" | "json") {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify({ ...result, id: Date.now() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carousel_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générer du contenu</h1>
        <p className="text-gray-500 text-sm mt-1">Donne un sujet ou laisse Claude en inventer un.</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Ex : Les cookies et le RGPD sur votre site…"
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
        />

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => generate(false)}
            disabled={loading || !topic.trim()}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Générer
          </button>
          <button
            onClick={() => generate(true)}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            Surprise
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Slides preview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                Carrousel généré · {result.slides?.length} slides
              </span>
              <button
                onClick={() => generate(!!topic.trim() === false)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Régénérer
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {result.slides?.map((s, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="text-xs text-gray-400 mb-1">Slide {i + 1}{s.is_last ? " · Dernière" : ""}</div>
                  <div className="font-bold text-gray-900 text-sm">{s.title}</div>
                  {s.bold && <div className="text-sm font-semibold text-blue-900 mt-1">{s.bold}</div>}
                  {s.paragraphs?.map((p, j) => (
                    <p key={j} className="text-sm text-gray-600 mt-1 leading-relaxed">{p}</p>
                  ))}
                  {s.sources && <p className="text-xs text-gray-400 mt-2 italic">{s.sources}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Caption */}
          {result.caption && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption Instagram</span>
                <button onClick={() => copy(result.caption!, "caption")}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition">
                  {copied === "caption"
                    ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copié</>
                    : <><Copy className="h-3.5 w-3.5" /> Copier</>}
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-xl p-3 leading-relaxed">
                {result.caption}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadJson}
              className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition"
            >
              <Download className="h-4 w-4" />
              Télécharger JSON
            </button>
            <button
              onClick={() => setShowJson(s => !s)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              {showJson ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showJson ? "Masquer" : "Voir"} le JSON
            </button>
            {showJson && (
              <button
                onClick={() => copy(rawJson, "json")}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                {copied === "json"
                  ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copié</>
                  : <><Copy className="h-3.5 w-3.5" /> Copier JSON</>}
              </button>
            )}
          </div>

          {/* Raw JSON */}
          {showJson && (
            <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded-2xl overflow-x-auto leading-relaxed">
              {rawJson}
            </pre>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Pour utiliser ce carrousel :</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Télécharge le JSON ci-dessus</li>
              <li>
                Ajoute-le dans{" "}
                <code className="bg-blue-100 px-1 rounded text-xs">instagram-automation/content/carousels_blanc.json</code>
              </li>
              <li>
                Lance{" "}
                <code className="bg-blue-100 px-1 rounded text-xs">python export.py --no-stories</code>
              </li>
              <li>Récupère les images dans le dossier export/</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
