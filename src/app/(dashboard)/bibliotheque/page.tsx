"use client";

import { useState } from "react";
import { BookOpen, XCircle, CheckCircle2, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { FORMULATIONS_LIBRARY } from "@/lib/data/formulations-library";
import { THEME_LABELS } from "@/types/scanner";
import type { FormulationTheme, FormulationEntry } from "@/types/scanner";

// ─── Thèmes disponibles ───────────────────────────────────────────────────────

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

// ─── Composant entrée ─────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: FormulationEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-3">
        {/* À éviter */}
        <div className="flex items-start gap-2.5">
          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-red-500 font-medium uppercase tracking-wide">À éviter</span>
            <p className="text-sm text-gray-700 mt-0.5 line-through decoration-red-300">
              « {entry.toAvoid} »
            </p>
          </div>
        </div>

        {/* Formulation safe */}
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

      {/* Pourquoi c'est risqué — expandable */}
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

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BibliothequeePage() {
  const [activeTheme, setActiveTheme] = useState<FormulationTheme | "all">("all");

  const entries =
    activeTheme === "all"
      ? FORMULATIONS_LIBRARY
      : FORMULATIONS_LIBRARY.filter((e) => e.theme === activeTheme);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-zen-700" />
          Bibliothèque de formulations
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Formulations validées, classées par thème. Copiez-les directement dans vos contenus.
        </p>
      </div>

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
          Tous ({FORMULATIONS_LIBRARY.length})
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
              <span className={`text-xs ${activeTheme === theme ? "opacity-70" : "text-gray-400"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Résultats */}
      {activeTheme !== "all" && (
        <div className="bg-zen-50 border border-zen-100 rounded-xl px-4 py-3">
          <p className="text-sm text-zen-800">
            <strong>{THEME_ICONS[activeTheme]} {THEME_LABELS[activeTheme]}</strong>
            {" "}— {entries.length} formulation{entries.length > 1 ? "s" : ""} validée{entries.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Grille d'entrées */}
      <div className="grid sm:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Note de bas de page */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
        <strong>Rappel :</strong> Ces formulations sont des points de départ, à adapter à votre contexte.
        En cas de doute sur une situation particulière, consultez un juriste spécialisé.
      </div>
    </div>
  );
}
