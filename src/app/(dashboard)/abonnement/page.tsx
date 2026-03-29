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

const plans = [
  {
    id: "essentiel",
    name: "Essentiel",
    price: 29,
    description: "Pour une conformité complète",
    recommended: true,
    features: [
      "10 audits par mois",
      "Audit SEO complet",
      "Audit juridique (termes interdits + mentions)",
      "Historique 30 jours",
      "Support par email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 59,
    description: "Pour les professionnels actifs",
    recommended: false,
    features: [
      "Audits illimités",
      "Audit SEO complet",
      "Audit juridique avancé",
      "Analyse nuancée par IA (Claude)",
      "Export PDF des rapports",
      "Historique illimité",
      "Support prioritaire",
    ],
  },
];

export default function AbonnementPage() {
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan");
      setSuccessMessage(
        `Bienvenue dans le plan ${plan} ! Votre abonnement est actif.`
      );
    }
  }, [searchParams]);

  async function subscribe(planId: string) {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choisissez le plan qui correspond à votre activité
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gratuit */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <h3 className="font-bold text-lg mb-1">Gratuit</h3>
          <p className="text-gray-400 text-sm mb-4">Pour découvrir l&apos;outil</p>
          <div className="text-3xl font-bold mb-5">0 €</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {[
              { label: "1 audit par mois", ok: true },
              { label: "Audit SEO complet", ok: true },
              { label: "Audit juridique", ok: false },
              { label: "Analyse IA", ok: false },
              { label: "Export PDF", ok: false },
            ].map((f) => (
              <li key={f.label} className="flex items-center gap-2">
                {f.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200" />
                )}
                <span className={f.ok ? "" : "text-gray-400"}>{f.label}</span>
              </li>
            ))}
          </ul>
          <div className="text-center text-sm text-gray-400 py-2 border border-gray-100 rounded-lg">
            Plan actuel gratuit
          </div>
        </div>

        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 border-2 ${
              plan.recommended
                ? "border-green-600 bg-white"
                : "border-gray-800 bg-gray-900 text-white"
            } relative`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Recommandé
              </div>
            )}
            <h3
              className={`font-bold text-lg mb-1 flex items-center gap-2 ${
                plan.id === "pro" ? "text-white" : ""
              }`}
            >
              {plan.name}
              {plan.id === "pro" && (
                <Sparkles className="h-4 w-4 text-yellow-400" />
              )}
            </h3>
            <p
              className={`text-sm mb-4 ${
                plan.id === "pro" ? "text-gray-400" : "text-gray-400"
              }`}
            >
              {plan.description}
            </p>
            <div
              className={`text-3xl font-bold mb-5 ${
                plan.id === "pro" ? "text-white" : ""
              }`}
            >
              {plan.price} €
              <span
                className={`text-base font-normal ${
                  plan.id === "pro" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                /mois
              </span>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className={`flex items-center gap-2 ${
                    plan.id === "pro" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      plan.id === "pro" ? "text-yellow-400" : "text-green-600"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50 ${
                plan.id === "pro"
                  ? "bg-white text-gray-900 hover:bg-gray-100"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  S&apos;abonner au plan {plan.name}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Gestion abonnement existant */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 flex items-center gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-gray-500" />
            Déjà abonné ?
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            Gérez votre abonnement, consultez vos factures ou résiliez via le portail Stripe.
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

      <p className="text-xs text-gray-400 text-center">
        Sans engagement · Résiliable à tout moment · Paiement sécurisé par Stripe
      </p>
    </div>
  );
}
