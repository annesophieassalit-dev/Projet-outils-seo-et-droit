"use client";

import Link from "next/link";
import { Clock, AlertTriangle, Sparkles } from "lucide-react";

interface TrialBannerProps {
  isTrialing: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
}

export default function TrialBanner({ isTrialing, trialDaysLeft, trialExpired }: TrialBannerProps) {
  if (trialExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Votre période d&apos;essai est terminée. Continuez avec un abonnement à 19€/mois.</span>
        </div>
        <Link
          href="/abonnement"
          className="shrink-0 bg-white text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
        >
          Choisir un plan
        </Link>
      </div>
    );
  }

  if (!isTrialing) return null;

  if (trialDaysLeft <= 3) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            Plus que <strong>{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""}</strong> dans votre essai.
          </span>
        </div>
        <Link
          href="/abonnement"
          className="shrink-0 bg-white text-amber-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors"
        >
          S'abonner
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zen-700 text-white px-4 py-2 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>
          Essai en cours — <strong>{trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} restant{trialDaysLeft > 1 ? "s" : ""}</strong>. Accès complet. Un email vous préviendra avant le renouvellement.
        </span>
      </div>
      <Link
        href="/abonnement"
        className="shrink-0 bg-white text-zen-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-zen-50 transition-colors"
      >
        Voir les plans
      </Link>
    </div>
  );
}
