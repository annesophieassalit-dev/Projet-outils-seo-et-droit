"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  XCircle,
  CheckCircle2,
  Scale,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { FORMULATIONS_LIBRARY } from "@/lib/data/formulations-library";
import { THEME_LABELS } from "@/types/scanner";
import type { FormulationTheme, FormulationEntry } from "@/types/scanner";

const THEMES: FormulationTheme[] = [
  "stress",
  "sommeil",
  "fatigue",
  "emotions",
  "douleurs",
  "confiance",
  "alimentation",
  "presentation_generale",
];

const THEME_ICONS: Record<FormulationTheme, string> = {
  stress: "😮‍💨",
  sommeil: "🌙",
  fatigue: "⚡",
  emotions: "💛",
  douleurs: "🌿",
  confiance: "✨",
  alimentation: "🥗",
  presentation_generale: "👤",
};

const FREE_VISIBLE_PER_THEME = 2;

// ─── Carte d'entrée (déverrouillée) ──────────────────────────────────────────

function EntryCard({ entry }: { entry: FormulationEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-red-500 font-medium uppercase tracking-wide">À éviter</span>
            <p className="text-sm text-gray-700 mt-0.5 line-through decoration-red-300">
              « {entry.toAvoid} »
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-zen-700 font-medium uppercase tracking-wide">Formulation validée</span>
            <p className="text-sm text-zen-800 font-medium mt-0.5">
              « {entry.safe} »
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span>Pourquoi c&apos;est risqué ?</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 space-y-1.5">
          <p className="text-xs text-amber-800">{entry.whyRisky}</p>
          {entry.legalReference && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Scale className="h-3 w-3 shrink-0" />
              {entry.legalReference}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Carte verrouillée ────────────────────────────────────────────────────────

function LockedCard() {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden opacity-60 relative">
      <div className="p-4 space-y-3 blur-[2px] select-none pointer-events-none">
        <div className="flex items-start gap-2.5">
          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-red-400 font-medium uppercase tracking-wide">À éviter</span>
            <p className="text-sm text-gray-500 mt-0.5 line-through">
              « ████████████ »
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-zen-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-zen-500 font-medium uppercase tracking-wide">Formulation validée</span>
            <p className="text-sm text-gray-400 mt-0.5">
              « ████████████████████ »
            </p>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-1.5 shadow-sm border border-gray-200">
          <Lock className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-600 font-medium">Pro</span>
        </div>
      </div>
    </div>
  );
}

// ─── Bannière upgrade ─────────────────────────────────────────────────────────

function UpgradeBanner({ lockedCount }: { lockedCount: number }) {
  return (
    <div className="bg-gradient-to-r from-zen-50 to-green-50 border border-zen-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-zen-100 rounded-lg">
          <Sparkles className="h-5 w-5 text-zen-700" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {lockedCount} formulations supplémentaires disponibles en Pro
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            Accédez à l&apos;intégralité de la bibliothèque — classée par thème, exportable, mise à jour régulièrement.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Link
          href="/abonnement"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zen-700 text-white rounded-lg text-sm font-medium hover:bg-zen-800 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Passer au plan Pro
        </Link>
        <a
          href="https://visibleetconforme.fr/ebook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Ou acheter le guide PDF — 37€
        </a>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BibliothequeClient({ plan }: { plan: string }) {
  const [activeTheme, setActiveTheme] = useState<FormulationTheme | "all">("all");
  const isPro = plan === "pro";

  const allEntries =
    activeTheme === "all"
      ? FORMULATIONS_LIBRARY
      : FORMULATIONS_LIBRARY.filter((e) => e.theme === activeTheme);

  const visibleEntries: FormulationEntry[] = [];
  const lockedCount = { value: 0 };

  if (isPro) {
    visibleEntries.push(...allEntries);
  } else {
    if (activeTheme === "all") {
      THEMES.forEach((theme) => {
        const themeEntries = FORMULATIONS_LIBRARY.filter((e) => e.theme === theme);
        visibleEntries.push(...themeEntries.slice(0, FREE_VISIBLE_PER_THEME));
        lockedCount.value += Math.max(0, themeEntries.length - FREE_VISIBLE_PER_THEME);
      });
    } else {
      visibleEntries.push(...allEntries.slice(0, FREE_VISIBLE_PER_THEME));
      lockedCount.value = Math.max(0, allEntries.length - FREE_VISIBLE_PER_THEME);
    }
  }

  const totalLocked = lockedCount.value;
  const totalInView = allEntries.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-zen-700" />
          Bibliothèque de formulations
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isPro
            ? `${FORMULATIONS_LIBRARY.length} formulations validées, classées par thème. Copiez-les directement dans vos contenus.`
            : "Les formulations pour ne plus jamais vous retrouver hors-la-loi dans vos communications."}
        </p>
      </div>

      {/* Bannière upgrade pour gratuit */}
      {!isPro && (
        <UpgradeBanner lockedCount={FORMULATIONS_LIBRARY.length - THEMES.length * FREE_VISIBLE_PER_THEME} />
      )}

      {/* Filtres par thème */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTheme("all")}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            activeTheme === "all"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Tous {isPro ? `(${FORMULATIONS_LIBRARY.length})` : ""}
        </button>
        {THEMES.map((theme) => {
          const count = FORMULATIONS_LIBRARY.filter((e) => e.theme === theme).length;
          return (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1.5 ${
                activeTheme === theme
                  ? "bg-zen-700 text-white border-zen-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-zen-400"
              }`}
            >
              <span>{THEME_ICONS[theme]}</span>
              {THEME_LABELS[theme]}
              {isPro && (
                <span className={`text-xs ${activeTheme === theme ? "opacity-70" : "text-gray-400"}`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Info thème actif */}
      {activeTheme !== "all" && (
        <div className="bg-zen-50 border border-zen-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-zen-800">
            <strong>{THEME_ICONS[activeTheme]} {THEME_LABELS[activeTheme]}</strong>
            {" "}— {isPro ? totalInView : Math.min(FREE_VISIBLE_PER_THEME, totalInView)} formulation{totalInView > 1 ? "s" : ""}{" "}
            {!isPro && totalInView > FREE_VISIBLE_PER_THEME && (
              <span className="text-zen-600">sur {totalInView} disponibles</span>
            )}
          </p>
        </div>
      )}

      {/* Grille d'entrées visibles */}
      <div className="grid sm:grid-cols-2 gap-4">
        {visibleEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}

        {/* Cartes verrouillées */}
        {!isPro && Array.from({ length: Math.min(totalLocked, activeTheme === "all" ? 8 : 4) }).map((_, i) => (
          <LockedCard key={`locked-${i}`} />
        ))}
      </div>

      {/* CTA milieu de page si beaucoup de contenu verrouillé */}
      {!isPro && totalLocked > 4 && (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-gray-500">
            + {totalLocked} formulations supplémentaires en Pro
          </p>
          <Link
            href="/abonnement"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zen-700 text-white rounded-lg text-sm font-medium hover:bg-zen-800 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Débloquer toute la bibliothèque
          </Link>
        </div>
      )}

      {/* Note de bas de page */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
        <strong>Rappel :</strong> Ces formulations sont des points de départ, à adapter à votre contexte.
        En cas de doute sur une situation particulière, consultez un juriste spécialisé.
      </div>
    </div>
  );
}
