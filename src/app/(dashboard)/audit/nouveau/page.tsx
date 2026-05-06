"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Globe,
  Sparkles,
} from "lucide-react";

export default function NouvelAuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  function normalizeUrl(input: string): string {
    let u = input.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      u = "https://" + u;
    }
    try {
      return new URL(u).toString();
    } catch {
      return u;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProgress("Connexion au site…");

    const normalizedUrl = normalizeUrl(url);

    try {
      setProgress("Analyse SEO et juridique en cours…");

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          router.push("/abonnement?raison=limite");
          return;
        }
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setProgress("Rapport prêt !");
      router.push(`/audit/${data.audit.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Analyser un site
        </h1>
        <p className="text-gray-500">
          Entrez l&apos;URL de votre site pour obtenir votre rapport SEO et conformité.
        </p>
      </div>

      {/* Ce qui va être analysé */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-blue-900 text-sm mb-1">Audit visibilité</h3>
          <ul className="text-xs text-blue-700 space-y-0.5">
            <li>· Balises title et meta</li>
            <li>· Structure H1/H2/H3</li>
            <li>· Images, mobile, HTTPS</li>
            <li>· Données structurées</li>
          </ul>
        </div>
        <div className="bg-zen-50 border border-zen-200 rounded-xl p-4">
          <ShieldCheck className="h-6 w-6 text-zen-700 mb-2" />
          <h3 className="font-semibold text-zen-900 text-sm mb-1">Audit conformité</h3>
          <ul className="text-xs text-zen-700 space-y-0.5">
            <li>· Formulations à risque juridique</li>
            <li>· Mentions légales, RGPD</li>
            <li>· Confusion professionnelle</li>
            <li>· Protection consommateur</li>
          </ul>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL du site à analyser
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-zen-600 focus-within:border-transparent">
              <div className="pl-4 pr-2 shrink-0">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={loading}
                className="flex-1 py-3 pr-4 text-sm focus:outline-none placeholder-gray-400"
                placeholder="mon-site-naturopathie.fr"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Entrez l&apos;URL de votre page d&apos;accueil ou d&apos;une page spécifique
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {loading && progress && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              {progress}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-zen-700 text-white py-3.5 rounded-xl font-semibold hover:bg-zen-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Lancer l&apos;analyse
              </>
            )}
          </button>
        </form>
      </div>

      {/* Note légale */}
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-4 border border-gray-100">
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-gray-300" />
        <p>
          L&apos;analyse juridique est indicative et ne constitue pas un avis
          juridique. Les résultats vous donnent une première lecture du
          risque et des pistes d&apos;amélioration. Pour une analyse complète,
          consultez un professionnel du droit.
        </p>
      </div>
    </div>
  );
}
