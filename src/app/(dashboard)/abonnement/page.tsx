"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Sparkles,
  CreditCard,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AbonnementPage() {
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setSuccessMessage("Bienvenue dans le plan Pro ! Votre abonnement est actif.");
    }
  }, [searchParams]);

  async function subscribe(planId: string) {
    setLoadingPlan(planId);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        setCheckoutError(`Erreur serveur ${res.status} — ${text.slice(0, 200) || "réponse non-JSON"}`);
        setLoadingPlan(null);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || `Erreur ${res.status} — aucune URL retournée`);
        setLoadingPlan(null);
      }
    } catch (err) {
      setCheckoutError(`Erreur réseau : ${err instanceof Error ? err.message : String(err)}`);
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError("Aucun abonnement actif trouvé. Souscrivez un plan ci-dessus pour accéder à la gestion.");
        setPortalLoading(false);
      }
    } catch {
      setPortalError("Une erreur est survenue. Réessayez dans quelques instants.");
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choisissez le plan qui correspond à votre activité
        </p>
      </div>

      {successMessage && (
        <div className="bg-zen-50 border border-zen-200 text-zen-800 px-5 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Essai */}
        <div className="border-2 border-zen-600 rounded-2xl p-6 bg-white relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zen-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Recommandé
          </div>
          <h3 className="font-bold text-lg mb-1">Essai 7 jours</h3>
          <p className="text-gray-500 text-sm mb-4">Pour tester l&apos;outil · Sans engagement</p>
          <div className="text-3xl font-bold mb-1">1 €</div>
          <p className="text-xs text-gray-500 mb-5">Pour 7 jours d&apos;accès · Puis 19€/mois</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {[
              "10 générations de contenus incluses",
              "Diagnostics site illimités",
              "Vérifications de texte illimitées",
              "Bibliothèque de formulations",
              "Accès à toutes les fonctionnalités",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => subscribe("pro")}
            disabled={loadingPlan !== null}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 bg-zen-700 text-white hover:bg-zen-800"
          >
            {loadingPlan === "pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Démarrer pour 1€"}
          </button>
        </div>

        {/* Pro direct */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            Pro
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h3>
          <p className="text-gray-500 text-sm mb-4">Tous les outils, sans limite</p>
          <div className="text-3xl font-bold mb-1">
            19 €<span className="text-base font-normal text-gray-500">/mois</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">Sans engagement · Résiliable à tout moment</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {[
              "Diagnostics illimités (SEO + conformité)",
              "Scans de texte illimités avec IA",
              "Générateur de contenus illimité",
              "Bibliothèque de formulations complète",
              "Export PDF des rapports",
              "Historique illimité",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => subscribe("pro_direct")}
            disabled={loadingPlan !== null}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 bg-coral-500 text-white hover:bg-coral-600"
          >
            {loadingPlan === "pro_direct" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" />S&apos;abonner à 19€/mois</>}
          </button>
          {checkoutError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
              {checkoutError}
            </p>
          )}
        </div>
      </div>

      {/* Gestion abonnement existant */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-gray-500" />
              Déjà abonné ?
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Gérez votre abonnement, consultez vos factures ou résiliez.
            </p>
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="shrink-0 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Gérer mon abonnement
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        {portalError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {portalError}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Sans engagement · Résiliable à tout moment · Paiement sécurisé par Stripe
      </p>
    </div>
  );
}
